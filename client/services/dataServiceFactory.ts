import PostgresBusinessDataService from "./postgresBusinessDataService";

// Factory function to get the data service - LIVE DATABASE ONLY
export function getDataService() {
  console.log("✅ LIVE DATABASE MODE: Using PostgreSQL data service");
  console.log("❌ Mock data permanently disabled - All data from database");
  return PostgresBusinessDataService.getInstance();
}

// Export factory object for destructuring imports
export const dataServiceFactory = {
  getDataService,
};

// Export singleton instance (for backward compatibility)
export default getDataService();
