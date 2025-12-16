import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import DemoHomeMock from '@/pages/Demo/DemoHomeMock';
import DemoProductMock from '@/pages/Demo/DemoProductMock';
import DemoCartMock from '@/pages/Demo/DemoCartMock';
import DemoSellerMock from '@/pages/Demo/DemoSellerMock';
import DemoSuccessMock from '@/pages/Demo/DemoSuccessMock';

const DEMO_STEPS = [
  { id: 'home', duration: 3000, label: 'Découverte', component: DemoHomeMock },
  { id: 'product', duration: 4000, label: 'Sélection produit', component: DemoProductMock },
  { id: 'cart', duration: 4000, label: 'Commande', component: DemoCartMock },
  { id: 'validation', duration: 4000, label: 'Validation vendeur', component: DemoSellerMock },
  { id: 'success', duration: 5000, label: 'Paiement libéré', component: DemoSuccessMock },
];

const TOTAL_DURATION = DEMO_STEPS.reduce((acc, step) => acc + step.duration, 0);

const EmbeddedDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

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
    <div className="flex flex-col items-center gap-6">
      {/* Demo Phone Frame */}
      <div className="w-full max-w-sm h-[500px] bg-background rounded-3xl shadow-2xl overflow-hidden relative border border-border/50">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/10 rounded-b-xl z-10" />
        
        {/* Step Content */}
        <div className="h-full overflow-hidden">
          <div key={currentStep} className="h-full animate-fade-in">
            <CurrentComponent progress={stepProgress} />
          </div>
        </div>

        {/* Step Indicator Badge */}
        <div className="absolute top-8 left-3 right-3 flex justify-between items-center z-20">
          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-medium shadow-lg">
            {DEMO_STEPS[currentStep].label}
          </span>
          <span className="bg-background/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-medium border border-border">
            {currentStep + 1}/{DEMO_STEPS.length}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3">
        {/* Progress */}
        <div className="w-64 space-y-1">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
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

        {/* Buttons */}
        <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetDemo}
            className="h-8 w-8 rounded-full"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-10 w-10 rounded-full"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>

          <div className="text-xs text-muted-foreground px-2">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddedDemo;
