import { Badge } from "~/components/ui/badge";

export function meta() {
  return [
    { title: "Terms and Conditions - Timecracker" },
    { name: "description", content: "Stupidly simple timetracker" },
  ];
}

export default function TermsAndConditionsPage() {
  return (
    <div className="py-6 md:py-12 lg:py-16">
      <div className="container p-4 md:p-6 mx-auto border rounded-xl">
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h1>Terms and Conditions</h1>
          Last Updated: January 9, 2025
          <hr />
          <h2>1. Introduction</h2>
          <p>
            These Terms and Conditions ("Terms") govern your use of Timecracker
            (the "Application"), an open-source software application. By using
            the Application, you agree to be bound by these Terms.
          </p>
          <h2>2. Data Collection</h2>
          <p>
            The Application does not collect, store, process, or transmit any
            personal data or user information. Users are solely responsible for
            any data they input, store, or process while using the Application.
          </p>
          <h2>3. Disclaimer of Warranties</h2>
          <p>
            THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT
            WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. THE APPLICATION IS
            PROVIDED WITHOUT ANY REPRESENTATIONS OR WARRANTIES, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT.
          </p>
          <h2>4. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL THE DEVELOPERS, COPYRIGHT HOLDERS, OR CONTRIBUTORS
            BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN
            ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN
            CONNECTION WITH THE APPLICATION OR THE USE OR OTHER DEALINGS IN THE
            APPLICATION. THIS INCLUDES, BUT IS NOT LIMITED TO:
            <ul>
              <li>Any data loss or corruption</li>
              <li>System failures or malfunctions</li>
              <li>
                Any direct, indirect, incidental, special, exemplary, or
                consequential damages
              </li>
            </ul>
          </p>
          <h2>5. User Responsibilities</h2>
          <p>
            Users are responsible for:
            <ul>
              <li>Maintaining and backing up their own data</li>
              <li>
                Ensuring the Application is suitable for their intended use
              </li>
              <li>
                Using the Application in compliance with all applicable laws and
                regulations
              </li>
            </ul>
          </p>
          <h2>6. Open Source License</h2>
          <p>
            The Application is distributed under CC0 1.0 Universal. Users may
            modify and distribute the Application in accordance with the terms
            of this license.
          </p>
          <h2>7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Users will
            be notified of any changes by posting the updated Terms on our
            repository or website.
          </p>
          <h2>8. Contact Information</h2>
          <p>
            For questions about these Terms, please contact me by email{" "}
            <Badge variant="outline" className="px-1 text-sm">
              mmmykhailo@proton.me
            </Badge>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
