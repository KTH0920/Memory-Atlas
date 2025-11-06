const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const Memory = require("../models/memoryModel");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

// ✅ AWS S3 클라이언트 설정
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

    console.log("🔍 AWS KEYS:", {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      access: process.env.AWS_ACCESS_KEY ? "✅ OK" : "❌ MISSING",
      secret: process.env.AWS_SECRET_KEY ? "✅ OK" : "❌ MISSING",
    });

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

// ======================== 전체 추억 조회 (본인만) ========================
const getAllMemories = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ JWT에서 현재 로그인한 사용자 ID 추출
    const memories = await Memory.find({ createdBy: userId })
      .populate("createdBy", "email nickname")
      .sort({ date: -1 }); // 최신순 정렬(optional)
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

    // 새 이미지 업로드 시 교체
    if (req.file) {
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
      memory.imageUrl = imageUrl;
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

    // 단순히 DB에서 삭제 (S3에서도 지우려면 별도 AWS SDK v2 호출 추가 가능)
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
