import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import DemoHomeMock from './DemoHomeMock';
import DemoProductMock from './DemoProductMock';
import DemoCartMock from './DemoCartMock';
import DemoSellerMock from './DemoSellerMock';
import DemoSuccessMock from './DemoSuccessMock';

const DEMO_STEPS = [
  { id: 'home', duration: 3000, label: 'Découverte', component: DemoHomeMock },
  { id: 'product', duration: 4000, label: 'Sélection produit', component: DemoProductMock },
  { id: 'cart', duration: 4000, label: 'Commande', component: DemoCartMock },
  { id: 'validation', duration: 4000, label: 'Validation vendeur', component: DemoSellerMock },
  { id: 'success', duration: 5000, label: 'Paiement libéré', component: DemoSuccessMock },
];

const TOTAL_DURATION = DEMO_STEPS.reduce((acc, step) => acc + step.duration, 0);

const DemoPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [recordingMode, setRecordingMode] = useState(false);

  const resetDemo = useCallback(() => {
    setCurrentStep(0);
    setProgress(0);
    setStepProgress(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const stepDuration = DEMO_STEPS[currentStep].duration;
    const intervalTime = 50;
    const increment = (intervalTime / stepDuration) * 100;

    const interval = setInterval(() => {
      setStepProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          if (currentStep < DEMO_STEPS.length - 1) {
            setCurrentStep((s) => s + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        return next;
      });

      setProgress((prev) => {
        const stepContribution = DEMO_STEPS[currentStep].duration / TOTAL_DURATION;
        const baseProgress = DEMO_STEPS.slice(0, currentStep).reduce(
          (acc, step) => acc + (step.duration / TOTAL_DURATION) * 100,
          0
        );
        return Math.min(baseProgress + stepContribution * stepProgress, 100);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, stepProgress]);

  const CurrentComponent = DEMO_STEPS[currentStep].component;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 overflow-hidden">
      {/* Demo Content */}
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md h-[85vh] bg-background rounded-3xl shadow-2xl overflow-hidden relative border border-border/50">
          {/* Phone Frame */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/10 rounded-b-2xl z-10" />
          
          {/* Step Content with Animation */}
          <div className="h-full overflow-hidden">
            <div
              key={currentStep}
              className="h-full animate-fade-in"
            >
              <CurrentComponent progress={stepProgress} />
            </div>
          </div>

          {/* Step Indicator Badge */}
          {!recordingMode && (
            <div className="absolute top-10 left-4 right-4 flex justify-between items-center z-20">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                {DEMO_STEPS[currentStep].label}
              </span>
              <span className="bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium border border-border">
                {currentStep + 1}/{DEMO_STEPS.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {!recordingMode && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-fade-in">
          {/* Progress Bar */}
          <div className="w-80 space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {DEMO_STEPS.map((step, i) => (
                <span
                  key={step.id}
                  className={cn(
                    'transition-colors',
                    i <= currentStep ? 'text-primary font-medium' : ''
                  )}
                >
                  •
                </span>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3 bg-background/80 backdrop-blur-lg rounded-full px-4 py-2 border border-border shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetDemo}
              className="h-10 w-10 rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-12 w-12 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRecordingMode(true)}
              className="h-10 w-10 rounded-full"
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Cliquez sur 🎥 pour masquer les contrôles pendant l'enregistrement
          </p>
        </div>
      )}

      {/* Recording Mode Exit */}
      {recordingMode && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRecordingMode(false)}
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/50 backdrop-blur"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* BokaTrade Logo */}
      <div className="absolute top-6 left-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          BokaTrade
        </h1>
        <p className="text-xs text-muted-foreground">Le commerce B2B sécurisé</p>
      </div>
    </div>
  );
};

export default DemoPage;
