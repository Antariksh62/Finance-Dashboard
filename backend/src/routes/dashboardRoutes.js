const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { getSummary, getTrends, getCategoryBreakdown } = require('../controllers/dashboardController');

router.use(authenticate, authorize('admin', 'analyst', 'viewer'));

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/category-breakdown', getCategoryBreakdown);

module.exports = router;