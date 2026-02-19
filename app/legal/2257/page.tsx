export default function Compliance2257Page() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">18 U.S.C. § 2257 Compliance Statement</h1>
      <p className="mb-4 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose dark:prose-invert max-w-none">
        <h2>Exemption Statement</h2>
        <p>
          eddythedaddy is a user-generated content platform. All content on this website is uploaded by third-party users. eddythedaddy does not produce any of the content found on this site.
        </p>
        
        <h2>Records Custodian</h2>
        <p>
          In compliance with 18 U.S.C. § 2257 and 28 C.F.R. § 75, eddythedaddy maintains records for all content creators who participate in our monetization program or are verified as "Models" on our platform.
        </p>

        <div className="bg-gray-100 dark:bg-dark-800 p-6 rounded-lg my-6">
          <h3 className="text-lg font-semibold mb-2">Custodian of Records:</h3>
          <p>
            <strong>eddythedaddy Compliance Dept.</strong><br />
            123 Stream Avenue<br />
            Tech City, TC 90210<br />
            United States<br />
            Email: <a href="mailto:compliance@eddythedaddy.com" className="text-blue-500 hover:underline">compliance@eddythedaddy.com</a>
          </p>
        </div>

        <h2>User Certifications</h2>
        <p>
          By uploading content to eddythedaddy, users certify that:
        </p>
        <ul>
          <li>They are at least 18 years of age.</li>
          <li>All individuals depicted in the content are at least 18 years of age.</li>
          <li>They have obtained valid consent from all individuals depicted to upload and distribute the content.</li>
          <li>They maintain age verification records for all individuals depicted in accordance with 18 U.S.C. § 2257.</li>
        </ul>

        <h2>Reporting Violations</h2>
        <p>
          If you believe any content on this site involves minors or non-consensual activity, please report it immediately using the "Report" button on the video page or contact us at <a href="mailto:safety@eddythedaddy.com">safety@eddythedaddy.com</a>. We have a zero-tolerance policy for child sexual abuse material (CSAM) and non-consensual content.
        </p>
      </div>
    </div>
  );
}
