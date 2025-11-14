const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5000',
      'http://localhost:5001'
    ];

    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (!allowedOrigin) return false;
      // Handle both exact match and wildcard subdomain matching
      const allowedHost = allowedOrigin.replace(/https?:\/\//, '');
      const originHost = origin.replace(/https?:\/\//, '');
      return originHost === allowedHost || originHost.endsWith('.' + allowedHost);
    });

    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.error('CORS blocked origin:', origin);
      // In production, allow all origins temporarily for debugging
      // TODO: Remove this after identifying the frontend URL
      if (process.env.NODE_ENV === 'production') {
        console.warn('Allowing origin in production for debugging:', origin);
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

module.exports = corsOptions;
