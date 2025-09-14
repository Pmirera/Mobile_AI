<?php

class LandingPage {
    public function render() {
        // Render the HTML content for the landing page
        return '
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="../assets/css/style.css">
            <title>Mobile AI Landing Page</title>
        </head>
        <body>
            <header>
                <h1>Welcome to Mobile AI</h1>
                <p>Your gateway to the future of mobile technology.</p>
            </header>
            <main>
                <section>
                    <h2>Features</h2>
                    <ul>
                        <li>AI-Powered Solutions</li>
                        <li>Seamless Integration</li>
                        <li>User-Friendly Interface</li>
                    </ul>
                </section>
                <section>
                    <h2>Get Started</h2>
                    <button id="get-started">Start Now</button>
                </section>
            </main>
            <footer>
                <p>&copy; 2023 Mobile AI. All rights reserved.</p>
            </footer>
            <script src="../assets/js/main.js"></script>
        </body>
        </html>
        ';
    }
}