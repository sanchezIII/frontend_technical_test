# Clean API Configuration & Usage Guide

## 📋 Overview

This application uses **axios** for backend communications, implementing a robust system for error handling, interceptors, and custom hooks to facilitate development with a clean, functional approach.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_API_KEY=demo-key-123
NODE_ENV=development
```

### API Client Features

- ✅ **Timeout**: 10 seconds default
- ✅ **Authentication**: Automatic Bearer tokens
- ✅ **API Key**: Automatic X-API-Key headers
- ✅ **Interceptors**: Error handling and logging
- ✅ **Smart Error Handling**: Intelligent error management
- ✅ **File Upload/Download**: Native support

## 🛠️ Clean Service Pattern

All services follow a clean, functional pattern:

### Customer Service

```javascript
import { customerService } from "../services";

// Basic CRUD operations
const customers = await customerService.getAll();
const customer = await customerService.getById(id);
const newCustomer = await customerService.create(data);
const updatedCustomer = await customerService.update(id, data);
await customerService.delete(id);

// Search and pagination
const searchResults = await customerService.search("john");
const paginatedData = await customerService.getPaginated(1, 10, {
  status: "active",
});

// Specialized operations
const stats = await customerService.getStats(id);
const subscriptions = await customerService.getSubscriptions(id);
```

### Product Service

```javascript
import { productService } from "../services";

// Product operations
const products = await productService.getAll();
const categories = await productService.getCategories();
const categoryProducts = await productService.getByCategory("premium");

// Bulk operations
await productService.bulkUpdatePrices(priceUpdates);
await productService.bulkDelete([1, 2, 3]);
```

### Subscription Service

```javascript
import { subscriptionService } from "../services";

// Subscription management
await subscriptionService.pause(id);
await subscriptionService.resume(id);
await subscriptionService.cancel(id);
await subscriptionService.renew(id, 12);

// Status-based queries
const activeSubscriptions = await subscriptionService.getActive();
const expiring = await subscriptionService.getExpiring(30);
```

### Analytics Service

```javascript
import { analyticsService } from "../services";

// Analytics data
const dashboardMetrics = await analyticsService.getDashboardMetrics();
const revenueData = await analyticsService.getRevenueAnalytics({
  period: "monthly",
});
const growthMetrics = await analyticsService.getGrowthMetrics("quarterly");
```

## 🎣 Custom Hooks

### useApi - Basic Hook

```javascript
import { useApi } from "../hooks/useApi";
import { customerService } from "../services";

const CustomerComponent = () => {
  const { data, loading, error, execute } = useApi(
    () => customerService.getAll(),
    [], // dependencies
    {
      immediate: true,
      onSuccess: (data) => console.log("Success:", data),
      onError: (error) => console.error("Error:", error),
      transform: (data) => data.map((item) => ({ ...item, processed: true })),
    }
  );

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};
```

### useCrud - CRUD Operations

```javascript
import { useCrud } from "../hooks/useApi";
import { customerService } from "../services";

const CustomerCrud = () => {
  const { items, loading, error, getAll, create, update, remove, search } =
    useCrud(customerService, "customers");

  const handleCreate = async (customerData) => {
    try {
      await create(customerData);
      console.log("Customer created successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <div>{/* Your component here */}</div>;
};
```

### usePagination - Paginated Data

```javascript
import { usePagination } from "../hooks/useApi";
import { productService } from "../services";

const ProductList = () => {
  const {
    data,
    pagination,
    loading,
    error,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    refresh,
  } = usePagination(productService, 1, 10);

  return (
    <div>
      {data?.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}

      <div className="pagination">
        <button onClick={prevPage} disabled={pagination.page <= 1}>
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={pagination.page >= pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### useApiForm - Form Handling

```javascript
import { useApiForm } from "../hooks/useApi";
import { customerService } from "../services";

const CustomerForm = () => {
  const { submit, submitting, error, success } = useApiForm(
    customerService.create,
    {
      onSuccess: (data) => console.log("Customer created:", data),
      onError: (error) => console.error("Error:", error),
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      await submit(data);
    } catch (error) {
      // Error already handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save"}
      </button>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">Success!</p>}
    </form>
  );
};
```

## 🚨 Error Handling

The system automatically handles:

- **401**: Redirects to login and clears tokens
- **403**: Access denied
- **404**: Resource not found
- **422**: Validation errors
- **429**: Rate limiting
- **5xx**: Server errors
- **Network**: Connectivity errors

Errors are normalized to a consistent format:

```javascript
{
  message: "Descriptive message",
  status: 404,
  data: { /* error data */ },
  isNetworkError: false,
  originalError: { /* original error */ }
}
```

## 📊 Logging

In development, automatically logs:

- 🚀 Outgoing requests
- ✅ Successful responses
- ❌ Errors with details

## 🔒 Authentication

Tokens are handled automatically:

```javascript
import { auth } from "../services";

// Set token
auth.setToken("your-jwt-token");

// Clear authentication
auth.clearToken();

// Check authentication status
const isAuthenticated = auth.isAuthenticated();
```

## 📁 File Structure

```
src/
├── services/
│   ├── api.js              # Axios client base
│   ├── customerService.js  # Customer service
│   ├── productService.js   # Product service
│   ├── subscriptionService.js # Subscription service
│   ├── analyticsService.js # Analytics service
│   └── index.js           # Services index
├── hooks/
│   └── useApi.js          # Custom hooks
├── utils/
│   └── constants.js       # Constants and config
├── examples/
│   └── ServiceUsageExample.jsx # Usage examples
└── components/
    └── customers/
        └── CustomerList.jsx # Implementation example
```

## 🎯 Best Practices

1. **Use custom hooks** for common operations
2. **Handle errors** at component level when needed
3. **Use environment variables** for configuration
4. **Implement loading states** for better UX
5. **Normalize responses** in services if necessary
6. **Keep services pure** - no side effects
7. **Use functional patterns** - prefer functions over classes

## 🧪 Testing

Test API connectivity:

```javascript
import { checkApiHealth } from "../services";

// Health check
try {
  const health = await checkApiHealth();
  console.log("API is working:", health);
} catch (error) {
  console.error("API not available:", error);
}
```

## 📦 Service Patterns

### Direct API Calls

```javascript
// Simple direct calls
const response = await customerService.getAll();
const customers = response.data || response;
```

### With Hooks

```javascript
// Using custom hooks for state management
const { items, loading, error } = useCrud(customerService);
```

### Bulk Operations

```javascript
// Bulk operations
await customerService.bulkCreate([customer1, customer2]);
await productService.bulkUpdatePrices(priceUpdates);
await subscriptionService.bulkUpdateStatus([1, 2, 3], "active");
```

### File Operations

```javascript
// File upload/download
await customerService.importData(file);
await productService.exportData("csv");
```

## 🚀 Next Steps

1. Configure your backend on port 5001
2. Set up environment variables
3. Implement authentication
4. Add more endpoints as needed
5. Customize interceptors if necessary
6. Add TypeScript for better type safety (optional)

## 💡 Tips

- Keep service functions pure and stateless
- Use hooks for state management
- Handle errors consistently
- Implement proper loading states
- Use constants for configuration
- Document your API endpoints
