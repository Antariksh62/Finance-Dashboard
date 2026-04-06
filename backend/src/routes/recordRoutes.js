const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getRecords, getRecordById, createRecord, updateRecord, deleteRecord,
} = require('../controllers/recordController');

router.use(authenticate);

// Read: all roles
router.get('/', authorize('admin', 'analyst', 'viewer'), getRecords);
router.get('/:id', authorize('admin', 'analyst', 'viewer'), getRecordById);

// Mutate: admin only
router.post('/', authorize('admin'), createRecord);
router.patch('/:id', authorize('admin'), updateRecord);
router.delete('/:id', authorize('admin'), deleteRecord);

module.exports = router;