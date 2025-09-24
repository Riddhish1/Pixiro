import * as React from 'react';

type EmailTemplateProps = {
  webinarId: string;
}

const EmailTemplate= ({
  webinarId,
}:EmailTemplateProps) => (
  <div>
    <h1>Welcome, Join the webinar</h1>
    <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/live-webinar/${webinarId}`}>
      Click here
    </a>
  </div>
);


export default EmailTemplate;