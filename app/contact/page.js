export const metadata = {
  title: 'Contact Support | DreamMotion',
  description: 'Contact DreamMotion support for help, issues, or questions. Our team is here to assist you anytime.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Contact Support | DreamMotion',
    description: 'Contact DreamMotion support for help, issues, or questions. Our team is here to assist you anytime.',
    url: 'https://dreammotion.com/contact',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'DreamMotion Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Support | DreamMotion',
    description: 'Contact DreamMotion support for help, issues, or questions. Our team is here to assist you anytime.',
    images: ['/logo.png'],
  },
};

import ContactSupportPage from './ContactSupportClient';

export default function Page() {
  return <ContactSupportPage />;
}
