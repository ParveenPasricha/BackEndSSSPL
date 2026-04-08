const express = require('express');
const router = express.Router();
const controller = require('../../Controller/AdminController/ProductController');
const upload = require('../../middleware/upload');
const { authMiddleware } = require('../../middleware/authMiddleware');
const activityTracker = require('../../middleware/activityTracker');

router.get('/', controller.getAllProducts);
router.get('/:id', controller.getProduct);

router.use(authMiddleware, activityTracker)

router.post('/', upload.array('images', 10), controller.createProduct);
router.put('/:id', upload.array('images', 10), controller.updateProduct);
router.delete('/:id', controller.deleteProduct);


// Reviews route
router.post('/:id/reviews', controller.addReview);

// Benefits routes
router.post('/:id/benefits', upload.single('image'), controller.addBenefit);
router.put('/:id/benefits/:benefitId', upload.single('image'), controller.updateBenefit);
router.delete('/:id/benefits/:benefitId', controller.deleteBenefit);

// How to Use routes
router.post('/:id/how-to-use', upload.single('image'), controller.addHowToUse);
router.put('/:id/how-to-use/:howToUseId', upload.single('image'), controller.updateHowToUse);
router.delete('/:id/how-to-use/:howToUseId', controller.deleteHowToUse);

// FAQs routes
router.post('/:id/faqs', controller.addFAQ);
router.put('/:id/faqs/:faqId', controller.updateFAQ);
router.delete('/:id/faqs/:faqId', controller.deleteFAQ);

// Packs routes
router.post('/:id/packs', upload.single('image'), controller.addPack);
router.put('/:id/packs/:packId', upload.single('image'), controller.updatePack);
router.delete('/:id/packs/:packId', controller.deletePack);


// Primary Foods routes
router.post('/:id/foods-to-avoid/primary',upload.single('image'),controller.addPrimaryFood);
router.put('/:id/foods-to-avoid/primary/:foodId', upload.single('image'), controller.updatePrimaryFood);
router.delete('/:id/foods-to-avoid/primary/:foodId', controller.deletePrimaryFood);

// Fruits routes
router.post('/:id/foods-to-avoid/fruits', upload.single('image'), controller.addFruit);
router.put('/:id/foods-to-avoid/fruits/:fruitId', upload.single('image'), controller.updateFruit);
router.delete('/:id/foods-to-avoid/fruits/:fruitId', controller.deleteFruit);

// clinical validation
router.post('/:id/clinical-validation', upload.single('image'), controller.addClinicalValidation);
router.put('/:id/clinical-validation/:validationId', upload.single('image'), controller.updateClinicalValidation);
router.delete('/:id/clinical-validation/:validationId', controller.deleteClinicalValidation);

module.exports = router;