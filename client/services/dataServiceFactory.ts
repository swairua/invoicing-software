import MySQLBusinessDataService from "./mysqlBusinessDataService";

/**
 * Data Service Factory - LIVE DATABASE MODE ONLY
 *
 * This factory only returns the MySQL data service.
 * All fallback mechanisms have been removed per user requirements.
 * The application will fail fast if database connections are unavailable.
 */
export function getDataService() {
  console.log("✅ LIVE DATABASE MODE: Using MySQL data service");
  console.log("❌ Mock data permanently disabled - All data from database");
  console.log("⚠️  Application will fail if database is unavailable");
  return MySQLBusinessDataService.getInstance();
}

// Export factory object for destructuring imports
export const dataServiceFactory = {
  getDataService,
};

// Export singleton instance (for backward compatibility)
export default getDataService();
