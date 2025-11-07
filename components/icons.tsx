import React from 'react';

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.548L16.5 21.75l-.398-1.202a3.375 3.375 0 00-2.456-2.456L12.75 18l1.202-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.202a3.375 3.375 0 002.456 2.456L20.25 18l-1.202.398a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);


export const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const LockClosedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

export const LockOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 10-7.5 0v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a.75.75 0 011.5 0v6.75a4.5 4.5 0 01-4.5-4.5H8.25a4.5 4.5 0 01-4.5-4.5v-6.75a4.5 4.5 0 014.5-4.5v-3A5.25 5.25 0 0118 1.5z" />
  </svg>
);

export const CropIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.875 14.25l-4.5-4.5m0 0l4.5-4.5m-4.5 4.5h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12.75h12.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v12.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.75H8.25" />
    </svg>
);

export const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM21 12h-1.382m-2.023-4.22.487-.51.587-.587a.75.75 0 0 1 1.06 1.06l-.587.587-.51.487m-2.023 2.023-.487.51-.587.587a.75.75 0 0 1-1.06-1.06l.587-.587.51-.487m.587-1.053-.487-.51L17.5 8.513l.587-.587a.75.75 0 0 1 1.061 1.06l-.587.587-.51.487Zm-4.938-4.22.487.51.587.587a.75.75 0 0 1-1.06 1.06l-.587-.587-.51-.487m2.023-2.023.487.51.587.587a.75.75 0 0 1-1.06-1.06l-.587-.587-.51-.487M9 11.25l-2.25-2.25L4.5 11.25l2.25 2.25L9 11.25Z" />
    </svg>
);