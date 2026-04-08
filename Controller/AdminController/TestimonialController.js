const Testimonial = require("../../Schema/AdminSchema/TestnomialSchema");

// GET ALL
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE
const createTestimonial = async (req, res) => {
  try {
    const { publishedBy } = req.body;
    const video = req.file ? req.file.path : req.body.video;

    if (!video || !publishedBy) {
      return res.status(400).json({ msg: "Video and PublishedBy required" });
    }

    const newTestimonial = new Testimonial({
      video,
      publishedBy
    });

    const saved = await newTestimonial.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// TOGGLE STATUS
const toggleTestimonialStatus = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.status =
      testimonial.status === "Active" ? "Inactive" : "Active";

    await testimonial.save();
    res.status(200).json(testimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ msg: "Testimonial not found" });
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(400).json({ msg: "Something went wrong" });
    console.log("Delete Error:", error);
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  toggleTestimonialStatus,
  deleteTestimonial
};
