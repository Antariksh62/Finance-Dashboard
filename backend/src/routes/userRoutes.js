const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAllUsers, getUserById, updateRole, updateStatus, deleteUser,
} = require('../controllers/userController');

router.use(authenticate);

router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);
router.patch('/:id/role', authorize('admin'), updateRole);
router.patch('/:id/status', authorize('admin'), updateStatus);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;