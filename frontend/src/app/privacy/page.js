export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
            <section className="py-12 sm:py-16 container mx-auto max-w-5xl bg-white rounded-2xl shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 sm:mb-12 text-center">
                    Privacy Policy
                </h1>

                <div className="space-y-6 px-4 sm:px-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center mb-8 shadow-lg">
                        <p className="text-gray-600 text-sm">Last updated April 15, 2025</p>
                    </div>

                    <div className="space-y-6">
                        {/* Introduction */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <p className="text-gray-600">
                                This Privacy Notice for <strong>HLC</strong> ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services.
                            </p>
                        </div>

                        {/* Key Points Summary */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">SUMMARY OF KEY POINTS</h2>
                            <p className="mb-6 text-gray-600">
                                <em>This summary provides key points from our Privacy Notice:</em>
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                                <div className="space-y-2">
                                    <p className="font-semibold">What personal information do we process?</p>
                                    <p>Depends on how you interact with our Services</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold">Do we process sensitive information?</p>
                                    <p>Only with your consent when necessary</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold">Third-party information sources?</p>
                                    <p>Public databases and other sources</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold">Your rights?</p>
                                    <p>Vary based on your location</p>
                                </div>
                            </div>
                        </div>

                        {/* Information Collection */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
                            <p className="mb-4 text-gray-600">
                                We collect personal information that you voluntarily provide when registering or contacting us.
                            </p>
                            <p className="mb-4 font-semibold text-gray-900">Personal Information Provided by You:</p>
                            <ul className="list-disc pl-6 space-y-3 text-gray-600">
                                <li>Names</li>
                                <li>Email addresses</li>
                                <li>Usernames</li>
                                <li>Passwords</li>
                                <li>Contact preferences</li>
                                <li>Payment information</li>
                                <li>Authentication data</li>
                            </ul>
                        </div>

                        {/* Information Processing */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
                            <p className="mb-4 text-gray-600">
                                We process information based on legitimate business interests, contractual obligations, legal requirements, and/or your consent.
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-gray-600">
                                <li>Account creation and authentication</li>
                                <li>Service delivery and improvement</li>
                                <li>Legal compliance</li>
                            </ul>
                        </div>

                        {/* Information Sharing */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. WHEN DO WE SHARE INFORMATION?</h2>
                            <div className="space-y-4 text-gray-600">
                                <p><em>In Short:</em> We may share information in specific situations described below.</p>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Transfers</h3>
                                    <p>Information may be shared during mergers, acquisitions, or asset sales.</p>
                                </div>
                            </div>
                        </div>

                        {/* Data Retention */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
                            <p className="text-gray-600">
                                <em>In Short:</em> We retain information only as long as necessary for the purposes outlined.
                            </p>
                            <p className="mt-2 text-gray-600">
                                We keep your personal information only as long as required by our legal obligations and business needs.
                            </p>
                        </div>

                        {/* Privacy Rights */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
                            <div className="space-y-4 text-gray-600">
                                <p><em>In Short:</em> You may review, change, or terminate your account at any time.</p>
                                
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Withdrawing Consent</h3>
                                    <p>You may withdraw consent for data processing at any time.</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Communications</h3>
                                    <p>Unsubscribe via links in our emails.</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Management</h3>
                                    <p>Update information through your account settings.</p>
                                </div>
                            </div>
                        </div>

                        {/* Do Not Track */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. DO-NOT-TRACK FEATURES</h2>
                            <p className="text-gray-600">
                                We honor DNT signals and do not track users who enable this browser setting.
                            </p>
                        </div>

                        {/* US Residents Rights */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. US RESIDENT PRIVACY RIGHTS</h2>
                            <div className="space-y-6 text-gray-600">
                                <p><em>In Short:</em> Additional rights may apply based on your state of residence.</p>
                                
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Collected Information Categories</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Category</th>
                                                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Examples</th>
                                                    <th className="border border-gray-200 px-4 py-2 text-left font-medium">Collected</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-gray-200 px-4 py-2">Identifiers</td>
                                                    <td className="border border-gray-200 px-4 py-2">Contact details, email addresses</td>
                                                    <td className="border border-gray-200 px-4 py-2">YES</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-200 px-4 py-2">Commercial Information</td>
                                                    <td className="border border-gray-200 px-4 py-2">Transaction history</td>
                                                    <td className="border border-gray-200 px-4 py-2">YES</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-200 px-4 py-2">Internet Activity</td>
                                                    <td className="border border-gray-200 px-4 py-2">Browsing history</td>
                                                    <td className="border border-gray-200 px-4 py-2">YES</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-200 px-4 py-2">Sensitive Information</td>
                                                    <td className="border border-gray-200 px-4 py-2">Financial data</td>
                                                    <td className="border border-gray-200 px-4 py-2">YES</td>
                                                </tr>
                                                {/* Add remaining table rows */}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600">
                                        *Additional information may be collected through direct interactions.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Information Sharing</h3>
                                    <p>No personal information sold or shared in past 12 months.</p>
                                </div>
                            </div>
                        </div>

                        {/* Policy Updates */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. POLICY UPDATES</h2>
                            <p className="text-gray-600">
                                We may update this notice to comply with legal requirements. Changes will be marked with a revised date.
                            </p>
                        </div>

                        {/* Contact Information */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. CONTACT US</h2>
                            <div className="space-y-2 text-gray-600">
                                <p>For questions or comments:</p>
                                <address className="not-italic mt-2">
                                    HLC<br />
                                    123 Privacy Lane<br />
                                    Data Protection City, DP 12345<br />
                                    United States
                                </address>
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. DATA MANAGEMENT</h2>
                            <div className="space-y-2 text-gray-600">
                                <p>Based on US state laws, you may:</p>
                                <ul className="list-disc pl-6">
                                    <li>Request access to your data</li>
                                    <li>Update or delete information</li>
                                    <li>Restrict processing</li>
                                </ul>
                                <p className="mt-2">
                                    Manage your data through: <a href="#" className="text-blue-600 hover:underline">Account Settings</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}