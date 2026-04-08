const Diagnosis = require("../../Schema/AdminSchema/DiagnosisSchema");

exports.submitDiagnosis = async (req, res) => {
  try {
    const {
      username,
      phone,
      gender,
      ageGroup,
      diabetesDuration,
      medicines,
      bloodSugars,
      eatingHabits,
      physicalActivity,
      healthIssues,
      otherHealthIssue,
      isGenetic,
      hasReport,
      score,
      stage,
      monthsRequired,
      monthsNum,
      controlPossibility,
      summary,
      recommendationImage,
      timeline,
      nutritionPercent,
      lifestylePercent,
      weightPercent,
      nutritionImpact,
      lifestyleImpact,
      weightImpact,
      allAnswers
    } = req.body;

    // Validate required fields
    if (!username || !phone) {
      return res.status(400).json({
        success: false,
        message: "Username and phone are required"
      });
    }

    // Check if diagnosis already exists for this phone
    const existingDiagnosis = await Diagnosis.findOne({ phone, username });

    let diagnosis;
    if (existingDiagnosis) {
      // Update existing diagnosis
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== '') {
          existingDiagnosis[key] = req.body[key];
        }
      });
      
      existingDiagnosis.updatedAt = Date.now();
      diagnosis = await existingDiagnosis.save();
      
      return res.status(200).json({
        success: true,
        message: 'Diagnosis updated successfully',
        data: diagnosis
      });
    }

    // Create new diagnosis
    diagnosis = await Diagnosis.create({
      username,
      phone,
      gender,
      ageGroup,
      diabetesDuration,
      medicines,
      bloodSugars,
      eatingHabits,
      physicalActivity,
      healthIssues,
      otherHealthIssue,
      isGenetic,
      hasReport: false,
      score: score || 0,
      stage,
      monthsRequired,
      monthsNum,
      controlPossibility,
      summary,
      recommendationImage,
      timeline,
      nutritionPercent,
      lifestylePercent,
      weightPercent,
      nutritionImpact,
      lifestyleImpact,
      weightImpact,
      allAnswers,
      status: 'Pending' // Default status
    });

    res.status(201).json({
      success: true,
      message: 'Diagnosis submitted successfully',
      data: diagnosis
    });
  } catch (error) {
    console.error('Submit Diagnosis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Upload medical report
// @route   POST /api/diagnosis/upload-report
// @access  Public
exports.uploadMedicalReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a medical report file (JPG, PNG, PDF)'
      });
    }

    const { phone, reportType = 'Blood Test', doctorName = '', notes = '' } = req.body;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required to link report'
      });
    }

    const diagnosis = await Diagnosis.findOne({ phone });
    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'No diagnosis found for this phone number'
      });
    }

    // Update diagnosis with report info
    diagnosis.hasReport = true;
    diagnosis.reportType = reportType;
    diagnosis.doctorName = doctorName;
    diagnosis.status = 'Completed';
    // diagnosis.fileUrl = `/uploads/medical-reports/${req.file.filename}`;
    diagnosis.fileUrl = req.file.path;
    diagnosis.fileName = req.file.originalname;
    diagnosis.fileSize = req.file.size;
    diagnosis.fileType = req.file.mimetype;
    diagnosis.updatedAt = Date.now();
    
    await diagnosis.save();

    res.status(200).json({
      success: true,
      message: 'Medical report uploaded successfully',
      data: {
        diagnosisId: diagnosis._id,
        patientId: diagnosis.patientId,
        patientName: diagnosis.username,
        reportUrl: diagnosis.fileUrl,
        fileName: diagnosis.fileName,
        fileType: diagnosis.fileType
      }
    });
  } catch (error) {
    console.error('Upload Medical Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get diagnosis by phone
// @route   GET /api/diagnosis/phone/:phone
// @access  Public
exports.getDiagnosisByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    const diagnosis = await Diagnosis.findOne({ phone });
    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'No diagnosis found for this phone number'
      });
    }

    res.status(200).json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    console.error('Get Diagnosis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all diagnoses (Admin) Diagnosis
// @route   GET /api/diagnosis
// @access  Private/Admin
exports.getAllDiagnosis = async (req, res) => {
  try {
    const { 
      hasReport, 
      status, 
      search, 
      stage,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = {};
    
    // Apply filters
    if (hasReport === 'true') query.hasReport = true;
    if (hasReport === 'false') query.hasReport = false;
    if (status) query.status = status;
    if (stage) query.stage = stage;
    
    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get diagnoses with pagination
    const diagnosis = await Diagnosis.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Diagnosis.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: diagnosis.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: diagnosis
    });
  } catch (error) {
    console.error('Get All Diagnosis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get diagnosis by ID
// @route   GET /api/diagnosis/:id
// @access  Private/Admin
exports.getDiagnosisById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const diagnosis = await Diagnosis.findById(id);
    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    console.error('Get Diagnosis by ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update diagnosis status
// @route   PUT /api/diagnosis/:id/status
// @access  Private/Admin
exports.updateDiagnosisStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const diagnosis = await Diagnosis.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: diagnosis
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get diagnosis statistics
// @route   GET /api/diagnosis/stats
// @access  Private/Admin
exports.getDiagnosisStats = async (req, res) => {
  try {
    const totalDiagnosis = await Diagnosis.countDocuments();
    const withReports = await Diagnosis.countDocuments({ hasReport: true });
    
    // Stage statistics
    const stage1 = await Diagnosis.countDocuments({ stage: 'Stage 1: Mild Sugar Level' });
    const stage2 = await Diagnosis.countDocuments({ stage: 'Stage 2: Moderate Sugar Level' });
    const stage3 = await Diagnosis.countDocuments({ stage: 'Stage 3: High Sugar Level' });
    
    // Status statistics
    const pending = await Diagnosis.countDocuments({ status: 'Pending' });
    const completed = await Diagnosis.countDocuments({ status: 'Completed' });
    const cancelled = await Diagnosis.countDocuments({ status: 'Cancelled' });
    
    // Monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await Diagnosis.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDiagnosis,
        withReports,
        byStage: {
          stage1,
          stage2,
          stage3
        },
        byStatus: {
          pending,
          completed,
          cancelled
        },
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete diagnosis
// @route   DELETE /api/diagnosis/:id
// @access  Private/Admin
exports.deleteDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    
    const diagnosis = await Diagnosis.findById(id);
    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found'
      });
    }

    await diagnosis.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Diagnosis deleted successfully'
    });
  } catch (error) {
    console.error('Delete Diagnosis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};