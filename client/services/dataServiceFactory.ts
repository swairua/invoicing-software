import BusinessDataService from "./businessDataService";
import PostgresBusinessDataService from "./postgresBusinessDataService";

// Configuration for data service
const USE_POSTGRES = true; // Set to true to use PostgreSQL, false for mock data

// Factory function to get the appropriate data service
export function getDataService() {
  if (USE_POSTGRES) {
    console.log("✅ LIVE DATABASE MODE: Using PostgreSQL data service");
    console.log("❌ Mock data disabled - All data from Supabase");
    return PostgresBusinessDataService.getInstance();
  } else {
    console.log("🎭 Using mock data service");
    return BusinessDataService.getInstance();
  }
}

// Export factory object for destructuring imports
export const dataServiceFactory = {
  getDataService,
};

// Export singleton instance (for backward compatibility)
export default getDataService();
