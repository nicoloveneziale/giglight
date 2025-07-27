import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header'; 

export const metadata = {
  title: 'GigLight',
  description: 'Find gigs and bands!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header /> 
          <main className="flex-grow"> 
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}