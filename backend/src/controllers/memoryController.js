const Memory = require("../models/memoryModel");

// ======================== 추억 등록 ========================
const createMemory = async (req, res) => {
  try {
    const { title, desc, tags, lat, lng, date } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "이미지 파일이 필요합니다." });
    }

    const imageUrl = req.file.location; // ✅ multer-s3가 자동으로 S3 업로드 후 location 반환

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

    // 새 이미지 업로드 시 교체
    if (req.file) {
      memory.imageUrl = req.file.location;
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
