// Combine all CSS and JS into the HTML to serve as a single file
const maintenancePage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Maintenance</title>
    <style>
        /* Include the contents of styles.css and themes.css here */
        ${/* Add your CSS content here */}
    </style>
</head>
<body>
    <!-- Your maintenance.html content here -->
</body>
<script>
    // Include the contents of main.js, favicon.js, and theme-detector.js here
    ${/* Add your JS content here */}
</script>
</html>`;

export default {
    async fetch(request, env, ctx) {
        // Configuration
        const MAINTENANCE_MODE = env.MAINTENANCE_MODE || false;
        const EXCLUDED_PATHS = ['/api', '/health', '/status']; // Add paths to exclude
        const EXCLUDED_DOMAINS = ['api.yourdomain.com']; // Add domains to exclude

        // Parse URL
        const url = new URL(request.url);
        const hostname = url.hostname;
        const path = url.pathname;

        // Check if path or domain is excluded
        const isExcludedPath = EXCLUDED_PATHS.some(excludedPath => path.startsWith(excludedPath));
        const isExcludedDomain = EXCLUDED_DOMAINS.includes(hostname);

        // Function to check origin health
        async function checkOriginHealth() {
            try {
                const response = await fetch(url.origin + '/health');
                return response.ok;
            } catch (error) {
                return false;
            }
        }

        // Determine if we should show maintenance page
        const shouldShowMaintenance = MAINTENANCE_MODE || !(await checkOriginHealth());

        // Return original request if not in maintenance or excluded
        if (!shouldShowMaintenance || isExcludedPath || isExcludedDomain) {
            try {
                return await fetch(request);
            } catch (error) {
                // If origin is unreachable and not excluded, show maintenance page
                if (!isExcludedPath && !isExcludedDomain) {
                    return new Response(maintenancePage, {
                        status: 503,
                        headers: {
                            'Content-Type': 'text/html;charset=UTF-8',
                            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0',
                        },
                    });
                }
                // Return error for excluded paths/domains
                return new Response('Service Unavailable', { status: 503 });
            }
        }

        // Serve maintenance page
        return new Response(maintenancePage, {
            status: 503,
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    },
};
