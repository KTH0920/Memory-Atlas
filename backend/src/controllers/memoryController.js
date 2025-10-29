const Memory = require("../models/memoryModel");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// S3 클라이언트 설정
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// ======================== 추억 등록 ========================
const createMemory = async (req, res) => {
  try {
    const { title, desc, tags, lat, lng, date } = req.body;
    if (!req.file) return res.status(400).json({ message: "이미지 파일이 필요합니다." });

    const key = `memory/${uuidv4()}_${req.file.originalname}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: "public-read",
      })
    );

    const imageUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const memory = new Memory({
      title,
      desc,
      tags: tags ? tags.split(",") : [],
      imageUrl,
      lat,
      lng,
      date,
      createdBy: req.user.id,
    });

    await memory.save();
    res.status(201).json({ message: "추억 등록 완료", memory });
  } catch (error) {
    console.error("Create Memory Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ======================== 전체 추억 조회 ========================
const getAllMemories = async (req, res) => {
  try {
    const memories = await Memory.find().populate("createdBy", "email nickname");
    res.json(memories);
  } catch (error) {
    console.error("getAllMemories Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ======================== 단일 추억 상세 조회 ========================
const getMemoryById = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id).populate("createdBy", "email nickname");
    if (!memory) return res.status(404).json({ message: "추억을 찾을 수 없습니다." });
    res.json(memory);
  } catch (error) {
    console.error("getMemoryById Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ======================== 추억 수정 ========================
const updateMemory = async (req, res) => {
  try {
    const { title, desc, tags, date } = req.body;
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: "추억을 찾을 수 없습니다." });

    if (memory.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "본인의 추억만 수정할 수 있습니다." });
    }

    // 새 이미지 업로드 시, 기존 이미지 삭제 후 교체
    if (req.file) {
      const oldKey = memory.imageUrl.split(".amazonaws.com/")[1];
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: oldKey }));

      const newKey = `memory/${uuidv4()}_${req.file.originalname}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: newKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          ACL: "public-read",
        })
      );

      memory.imageUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;
    }

    if (title) memory.title = title;
    if (desc) memory.desc = desc;
    if (tags) memory.tags = tags.split(",");
    if (date) memory.date = date;

    await memory.save();
    res.json({ message: "추억 수정 완료", memory });
  } catch (error) {
    console.error("updateMemory Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ======================== 추억 삭제 ========================
const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: "추억을 찾을 수 없습니다." });

    if (memory.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "본인의 추억만 삭제할 수 있습니다." });
    }

    const key = memory.imageUrl.split(".amazonaws.com/")[1];
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: key }));

    await memory.deleteOne();
    res.json({ message: "추억 삭제 완료" });
  } catch (error) {
    console.error("Delete Memory Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMemory,
  getAllMemories,
  getMemoryById,
  updateMemory,
  deleteMemory,
};
