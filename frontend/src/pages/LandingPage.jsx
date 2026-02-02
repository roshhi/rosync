import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader';

const features = [
  {
    id: 1,
    title: "Lightning Fast",
    description: "Upload files at blazing speeds with our optimized infrastructure.",
    icon: (
      <svg className="w-6 h-6 text-[#29C762]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Secure Storage",
    description: "End-to-end encryption ensures your files are always protected.",
    icon: (
      <svg className="w-6 h-6 text-[#29C762]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Easy Sharing",
    description: "Share files with anyone using secure, expirable links.",
    icon: (
      <svg className="w-6 h-6 text-[#29C762]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
];

const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loader while checking auth
  if (loading) {
    return <Loader />;
  }

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-fit bg-[#0B0B0F] px-6 mt-40">
      <div className="max-w-6xl mx-auto">
        
        <section className="text-center py-16">
          <h1 className="text-6xl md:text-6xl font-bold text-[#FFFFFF] leading-tight mb-6">
            The Modern Way to<br />
            <span className="text-[#29C762]">Upload & Share</span> Files
          </h1>
          <p className="text-[#C3C2C4] text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Experience seamless file management with enterprise-grade security. 
            Upload, organize, and share your files with unprecedented ease.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/signup" 
              className="px-8 py-3.5 bg-[#29C762] text-[#0B0B0F] font-semibold rounded-xl hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </section>

        <section className="py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.id}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-[50px] hover:border-[#29C762]/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#29C762]/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-[#FFFFFF] text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#818897] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default LandingPage;