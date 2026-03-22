## Instalation:

```
npm install
```

## Environment variables

Create `.env` file based on `.env.example`

## Runnig application

### Run in development mode:

```
npm run start:dev
```

### Run in production mode:

```
npm run start:prod
```

### Run in cluster mode:

```
npm run start:multi
```

## Testing

```
npm run test
```

or use next one for running in watch mode

```
npm run test:watch
```

## API endpoins

`GET /api/products` - to get all products

`POST /api/products` - to create new product

`GET /api/products/:id` - to get product by id

`PUT /api/products/:id` - to update product

`DELETE /api/products/:id` - to delete product
