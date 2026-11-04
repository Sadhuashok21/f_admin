import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

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

  const errorSpecs: Record<number, { img: string; heading: string; message: string; title: string }> = {
    400: {
      img: '400',
      heading: '400 Bad request',
      message: 'The request is malformed. Please refresh or try after some time.',
      title: '400 Bad Request'
    },
    401: {
      img: '400',
      heading: '401 Unauthorized request',
      message: 'Authentication is required to access the data.',
      title: '401 Unauthorized'
    },
    403: {
      img: '403',
      heading: '403 Forbidden',
      message: "You don't have permission to access this resource.",
      title: '403 Forbidden'
    },
    404: {
      img: '404',
      heading: "404 That's an error",
      message: `Your requested url ${location.pathname} was not found on this server. We will fix soon.`,
      title: '404 Not Found'
    },
    408: {
      img: '408',
      heading: '408 Request timeout',
      message: 'The server is busy. The request is not reached the server.',
      title: '408 Request Timeout'
    },
    500: {
      img: '500',
      heading: '500 Internal server error',
      message: `Your requested url ${location.pathname} has found an error. We will fix soon.`,
      title: '500 Internal Server Error'
    },
    502: {
      img: '502',
      heading: '502 Bad gateway',
      message: 'Server got ann invalid response.',
      title: '502 Bad Gateway'
    },
    503: {
      img: '503',
      heading: '503 Service unavailable',
      message: 'Server is temporarily down. Please try after some time.',
      title: '503 Service Unavailable'
    },
    504: {
      img: '504',
      heading: '504 Gateway timeout',
      message: "Server didn't get a response in time. Please try after some time.",
      title: '504 Gateway Timeout'
    },
    505: {
      img: '505',
      heading: '505 HTTP version not supported',
      message: "Server doesn't support the HTTP version used by browser. Please use different browser.",
      title: '505 HTTP Version Not Supported'
    }
  };

  const spec = errorSpecs[activeCode] || errorSpecs[404];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '85vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '36px',
          maxWidth: '920px',
          width: '100%'
        }}
      >
        {/* Status Illustration from Ascentracore CDN matching apis templates */}
        <img
          src={`https://cdn.ascentracoresolutions.com/status/${spec.img}.webp`}
          alt={String(activeCode)}
          style={{
            width: '380px',
            height: '380px',
            maxWidth: '100%',
            objectFit: 'contain'
          }}
        />

        {/* Brand Header & Details */}
        <div style={{ maxWidth: '460px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <img
              src="https://cdn.ascentracoresolutions.com/ascentra.webp"
              alt="logo"
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main, #1e293b)' }}>
              Ascentracore Solutions
            </span>
          </div>

          <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main, #334155)', margin: '10px 0' }}>
            {customTitle || spec.heading}
          </p>

          <p style={{ fontSize: '15px', color: 'var(--text-muted, #475569)', margin: '14px 0', lineHeight: '1.6' }}>
            {customMessage || (
              activeCode === 404 || activeCode === 500 ? (
                <>
                  Your requested url <b style={{ color: 'var(--primary, #0284c7)', wordBreak: 'break-all' }}>{location.pathname}</b> {activeCode === 404 ? 'was not found on this server. We will fix soon.' : 'has found an error. We will fix soon.'}
                </>
              ) : (
                spec.message
              )
            )}
          </p>

          <p style={{ fontSize: '14px', color: 'var(--text-muted, #64748b)', margin: '12px 0' }}>
            Thank you for your patience.
          </p>

          {/* Quick status code switcher for admin testing */}
          <div style={{ margin: '18px 0', padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em', marginBottom: '6px' }}>
              STATUS CODE TEMPLATES
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[400, 401, 403, 404, 408, 500, 502, 503, 504, 505].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCode(c)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid',
                    cursor: 'pointer',
                    fontWeight: 600,
                    backgroundColor: activeCode === c ? 'var(--primary, #0284c7)' : 'transparent',
                    color: activeCode === c ? '#ffffff' : 'var(--text-main, #334155)',
                    borderColor: activeCode === c ? 'var(--primary, #0284c7)' : '#cbd5e1'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <Link
              to="/"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--primary, #0284c7)',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              <Home size={16} />
              <span>Go to Dashboard</span>
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
