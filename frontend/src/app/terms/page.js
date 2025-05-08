export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
            <section className="py-12 sm:py-16 container mx-auto max-w-5xl bg-white rounded-2xl shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 sm:mb-12 text-center">
                    Terms of Service
                </h1>

                <div className="space-y-6 px-4 sm:px-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center mb-8 shadow-lg">
                        <p className="text-gray-600 text-sm">Effective: April 15, 2025</p>
                    </div>

                    <div className="space-y-6">
                        {/* Introduction */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <p className="text-gray-600">
                                These Terms of Service ("Terms") govern your use of HLC's gambling loss tracking services ("Services"). 
                                By accessing or using our Services, you agree to be bound by these Terms.
                            </p>
                        </div>

                        {/* Key Points Summary */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary of Key Points</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                                <div className="space-y-2">
                                    <p className="font-semibold">Service Description:</p>
                                    <p>Tools to track gambling losses and generate reports</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold">Your Responsibilities:</p>
                                    <p>Provide accurate information and use Services legally</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold">Prohibited Activities:</p>
                                    <p>Includes illegal use and data manipulation</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold">Limitations:</p>
                                    <p>No tax outcome guarantees - consult professionals</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Sections */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Your Agreement</h2>
                            <p className="text-gray-600">
                                By using HLC's Services, you agree to these Terms. If you disagree with any part, 
                                you may not access the Services.
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. What We Provide</h2>
                            <ul className="list-disc pl-6 space-y-3 text-gray-600">
                                <li>Gambling loss tracking and analytics</li>
                                <li>Tax report generation</li>
                                <li>Gambling habit monitoring</li>
                                <li>Data visualization and export</li>
                            </ul>
                            <p className="mt-4 text-gray-600 italic">
                                Important: HLC does not provide tax, legal, or financial advice.
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Your Responsibilities</h2>
                            <ul className="list-disc pl-6 space-y-3 text-gray-600">
                                <li>Provide complete and accurate information</li>
                                <li>Maintain account security</li>
                                <li>Use Services legally</li>
                                <li>Verify tax information with professionals</li>
                                <li>Be at least 18 years old</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Activities</h2>
                            <ul className="list-disc pl-6 space-y-3 text-gray-600">
                                <li>Illegal use of services</li>
                                <li>Account sharing</li>
                                <li>Data manipulation</li>
                                <li>Reverse engineering attempts</li>
                                <li>Unauthorized commercial use</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Account Termination</h2>
                            <div className="space-y-3 text-gray-600">
                                <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
                                <p className="font-semibold">Upon termination:</p>
                                <ul className="list-disc pl-6">
                                    <li>Service access immediately revoked</li>
                                    <li>Data retention as required by law</li>
                                    <li>Ongoing obligations remain</li>
                                </ul>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                            <ul className="list-disc pl-6 space-y-3 text-gray-600">
                                <li>No liability for tax consequences</li>
                                <li>No responsibility for gambling outcomes</li>
                                <li>No guarantee against service interruptions</li>
                                <li>Not liable for unauthorized access</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to Terms</h2>
                            <p className="text-gray-600">
                                We may modify these Terms at any time. Continued use after changes constitutes acceptance.
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
                            <p className="text-gray-600">
                                Governed by United States law without regard to conflict of law provisions.
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Dispute Resolution</h2>
                            <p className="text-gray-600">
                                Disputes resolved through binding arbitration with the American Arbitration Association.
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimer</h2>
                            <div className="space-y-3 text-gray-600">
                                <p>HLC does not promote gambling. Services for tracking purposes only.</p>
                                <p>
                                    Gambling problem help: <a href="/support" className="text-blue-600 hover:underline">Visit support page</a>
                                </p>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
                            <div className="space-y-2 text-gray-600">
                                <p>Email: <a href="mailto:info@gambl.com" className="text-blue-600 hover:underline">info@gambl.com</a></p>
                                <p>Phone: <a href="tel:+1234567890" className="text-blue-600 hover:underline">+1 (234) 567-890</a></p>
                                <p>Follow us on social media for updates</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}