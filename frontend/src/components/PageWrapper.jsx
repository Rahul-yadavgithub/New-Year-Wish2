import React from 'react';
import HeroSection from './HeroSection';
import MessageSequence from './MessageSequence';

const PageWrapper = ({ onHeroLeft }) => {
  return (
    <div className="w-full min-h-screen">
      <HeroSection onPinEnd={onHeroLeft} />
      <MessageSequence />
    </div>
  );
};

export default PageWrapper;
