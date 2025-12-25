import { User } from './User.model';
import { ServiceCategory } from './ServiceCategory.model';
import { ProviderProfile } from './ProviderProfile.model';
import { Booking } from './Booking.model';
import { Review } from './Review.model';

// User to ProviderProfile (1:1)
User.hasOne(ProviderProfile, {
  foreignKey: 'userId',
  as: 'providerProfile',
});
ProviderProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// ServiceCategory to ProviderProfile (1:Many)
ServiceCategory.hasMany(ProviderProfile, {
  foreignKey: 'serviceCategoryId',
  as: 'providers',
});
ProviderProfile.belongsTo(ServiceCategory, {
  foreignKey: 'serviceCategoryId',
  as: 'serviceCategory',
});

// User (customer) to Booking (1:Many)
User.hasMany(Booking, {
  foreignKey: 'customerId',
  as: 'bookingsAsCustomer',
});
Booking.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer',
});

// ProviderProfile to Booking (1:Many)
ProviderProfile.hasMany(Booking, {
  foreignKey: 'providerId',
  as: 'bookingsAsProvider',
});
Booking.belongsTo(ProviderProfile, {
  foreignKey: 'providerId',
  as: 'provider',
});

// ServiceCategory to Booking (1:Many)
ServiceCategory.hasMany(Booking, {
  foreignKey: 'serviceCategoryId',
  as: 'bookings',
});
Booking.belongsTo(ServiceCategory, {
  foreignKey: 'serviceCategoryId',
  as: 'serviceCategory',
});

// Booking to Review (1:1)
Booking.hasOne(Review, {
  foreignKey: 'bookingId',
  as: 'review',
});
Review.belongsTo(Booking, {
  foreignKey: 'bookingId',
  as: 'booking',
});

// User (customer) to Review (1:Many)
User.hasMany(Review, {
  foreignKey: 'customerId',
  as: 'reviewsGiven',
});
Review.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer',
});

// ProviderProfile to Review (1:Many)
ProviderProfile.hasMany(Review, {
  foreignKey: 'providerId',
  as: 'reviewsReceived',
});
Review.belongsTo(ProviderProfile, {
  foreignKey: 'providerId',
  as: 'provider',
});

export { User, ServiceCategory, ProviderProfile, Booking, Review };
