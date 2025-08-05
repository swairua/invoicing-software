import BusinessDataService from './businessDataService';
import PostgresBusinessDataService from './postgresBusinessDataService';

// Configuration for data service
const USE_POSTGRES = true; // Set to true to use PostgreSQL, false for mock data

// Factory function to get the appropriate data service
export function getDataService() {
  if (USE_POSTGRES) {
    console.log('🗄️  Using PostgreSQL data service');
    return PostgresBusinessDataService.getInstance();
  } else {
    console.log('🎭 Using mock data service');
    return BusinessDataService.getInstance();
  }
}

// Export singleton instance
export default getDataService();
