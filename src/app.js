const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const adminCategoryRoutes = require('./routes/admin.categories.routes');
const adminProductRoutes = require('./routes/admin.products.routes');
const adminAttributeRoutes = require('./routes/admin.attributes.routes');
const adminPageRoutes = require('./routes/admin.pages.routes');
const adminActivityRoutes = require('./routes/admin.activity.routes');
const adminSubcategoryRoutes = require('./routes/admin.subcategories.routes');
const adminStoreRoutes = require('./routes/admin.stores.routes');
const adminUserRoutes = require('./routes/admin.users.routes');
const adminRbacRoutes = require('./routes/admin.rbac.routes');
const adminOrderRoutes = require('./routes/admin.orders.routes');
const adminPaymentRoutes = require('./routes/admin.payments.routes');
const adminCartRoutes = require('./routes/admin.carts.routes');
const adminHomeBannerRoutes = require('./routes/admin.home-banners.routes');
const storeCategoryRoutes = require('./routes/store.categories.routes');
const storeProductRoutes = require('./routes/store.products.routes');
const storeHomeRoutes = require('./routes/store.home.routes');
const storeFavoritesRoutes = require('./routes/store.favorites.routes');
const storePublicRoutes = require('./routes/store.stores.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/orders.routes');
const addressRoutes = require('./routes/addresses.routes');

const errorHandler = require('./middlewares/errorHandler');
const { fail } = require('./utils/response');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Souqli API', data: null, errors: null });
});

app.use('/api/auth', authRoutes);

app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/subcategories', adminSubcategoryRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/attributes', adminAttributeRoutes);
app.use('/api/admin/pages', adminPageRoutes);
app.use('/api/admin/activity-logs', adminActivityRoutes);
app.use('/api/admin/stores', adminStoreRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/rbac', adminRbacRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/carts', adminCartRoutes);
app.use('/api/admin/home-banners', adminHomeBannerRoutes);

app.use('/api/categories', storeCategoryRoutes);
app.use('/api/products', storeProductRoutes);
app.use('/api/home', storeHomeRoutes);
app.use('/api/favorites', storeFavoritesRoutes);
app.use('/api/stores', storePublicRoutes);

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);

app.use((req, res) => fail(res, 'Route not found', null, 404));
app.use(errorHandler);

module.exports = app;
