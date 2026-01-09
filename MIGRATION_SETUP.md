# TypeORM Migration Setup

TypeORM migrations have been configured for the project.

## Files Created

- `src/backend/database/data-source.ts` - TypeORM DataSource configuration for CLI
- `src/backend/database/migrations/` - Directory for migration files

## Usage

### Run Migrations
```bash
cd src/backend
npm run migration:run
```

### Generate Migration
```bash
cd src/backend
npm run migration:generate
```

This will prompt you for a migration name and generate a migration file based on entity changes.

### Revert Last Migration
```bash
cd src/backend
npm run migration:revert
```

### Create Empty Migration
```bash
cd src/backend
npm run migration:create
```

## Configuration

The data source configuration reads from:
- `.env` file in project root
- `.env.local` file in project root (if exists)

Required environment variables:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 5432)
- `DB_USERNAME` (default: postgres)
- `DB_PASSWORD` (default: postgres)
- `DB_NAME` (default: keno_game)

## Notes

- Migrations are located in `src/backend/database/migrations/`
- The data source file uses the same entities as the NestJS application
- `synchronize` is set to `false` for production safety
