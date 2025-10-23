const { s3 } = require("../config/s3");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const Memory = require("../models/memoryModel");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();

// ✅ 추억 등록 (이미지 업로드)
const createMemory = async (req, res) => {
  try {
    const { title, desc, lat, lng, tags, date } = req.body;

    if (!title) return res.status(400).json({ message: "제목은 필수입니다." });
    if (!req.file) return res.status(400).json({ message: "이미지가 필요합니다." });

    const fileKey = `memory/${uuidv4()}_${req.file.originalname}`;
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(params));

    const imageUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    const memory = await Memory.create({
      title,
      desc,
      lat,
      lng,
      tags: tags ? tags.split(",") : [],
      date,
      imageUrl,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "추억 등록 완료", memory });
  } catch (error) {
    console.error("❌ Memory Upload Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✅ 전체 추억 조회
const getAllMemories = async (req, res) => {
  try {
    const memories = await Memory.find().populate("createdBy", "email nickname");
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ 단일 추억 삭제
const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: "추억을 찾을 수 없습니다." });

    // S3 이미지 삭제
    const fileKey = memory.imageUrl.split(".amazonaws.com/")[1];
    await s3.send(
      new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: fileKey })
    );

    await memory.deleteOne();
    res.json({ message: "추억 삭제 완료" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createMemory, getAllMemories, deleteMemory };
