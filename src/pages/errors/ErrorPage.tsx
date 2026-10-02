import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ code: defaultCode = 404, title: customTitle, message: customMessage }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const codeParam = parseInt(queryParams.get('code') || '', 10);
  const [activeCode, setActiveCode] = useState<number>(codeParam || defaultCode);

  const errorMessages: Record<number, { title: string; subtitle: string; desc: string }> = {
    400: {
      title: '400 Bad Request',
      subtitle: "That's an error",
      desc: 'The server cannot process the request due to malformed syntax.'
    },
    401: {
      title: '401 Unauthorized',
      subtitle: 'Authentication required',
      desc: 'The requested resource requires valid administrative authentication.'
    },
    403: {
      title: '403 Forbidden',
      subtitle: 'Access not permitted',
      desc: 'You do not have administrative clearance to access this path.'
    },
    404: {
      title: "404 That's an error",
      subtitle: 'Not Found',
      desc: `Your requested URL "${location.pathname}" was not found on this server. We will fix it soon.`
    },
    408: {
      title: '408 Request Timeout',
      subtitle: 'Server timed out waiting',
      desc: 'The server did not receive a complete request within the allowed time.'
    },
    500: {
      title: '500 Internal Server Error',
      subtitle: 'Unexpected Server Condition',
      desc: 'The server encountered an internal error. Please try again in a few moments.'
    },
    502: {
      title: '502 Bad Gateway',
      subtitle: 'Invalid Gateway Response',
      desc: 'The proxy gateway received an invalid response from the upstream daemon.'
    },
    503: {
      title: '503 Service Unavailable',
      subtitle: 'Temporary Maintenance',
      desc: 'The service is temporarily unable to handle your request due to maintenance.'
    },
    504: {
      title: '504 Gateway Timeout',
      subtitle: 'Upstream Gateway Timeout',
      desc: 'The gateway server did not receive a timely response from the backend service.'
    },
    505: {
      title: '505 HTTP Version Not Supported',
      subtitle: 'Unsupported Protocol',
      desc: 'The HTTP version used in the request is not supported by the web server.'
    }
  };

  const err = errorMessages[activeCode] || errorMessages[404];

  return (
    <div style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <img src="/as_logo.webp" alt="Ascentracore" style={{ width: '42px', height: '42px' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Ascentracore Solutions
          </span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', background: 'rgba(220,38,38,0.1)', color: 'var(--danger)', borderRadius: '20px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
          <AlertOctagon size={18} />
          <span>Error Status: {activeCode}</span>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {customTitle || err.title}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
          {customMessage || err.desc}
          <br />
          <span style={{ fontSize: '0.85rem' }}>Thank you for your patience.</span>
        </p>

        {/* Quick error code switcher to view all backend error pages (400-505) */}
        <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            PREVIEW OTHER STATUS CODES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {[400, 401, 403, 404, 408, 500, 502, 503, 504, 505].map(code => (
              <button
                key={code}
                className={`btn btn-sm ${activeCode === code ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={() => setActiveCode(code)}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>Go to Dashboard</span>
          </Link>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
