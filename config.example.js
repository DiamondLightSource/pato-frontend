/**
 * When deploying this application, mount custom runtime configs on the root of the deployment folder.
 * 
 * API_URL: base URL for API endpoints
 * AUTH_URL: base URL for authentication endpoints
 * DEV_CONTACT: email used for contacting application support
 * ENVIRONMENT: application environment - one of 'production', 'staging' or 'dev'
 * FEEDBACK_URL (optional): URL pointing to form that takes user feedback
 */

window.ENV = {
    API_URL: "/api/",
    AUTH_URL: "/auth/",
    DEV_CONTACT: "guilherme.de-freitas@diamond.ac.uk",
    ENVIRONMENT: "production",
    FEEDBACK_URL: "true",
    REPROCESSING_ENABLED: true,
}
