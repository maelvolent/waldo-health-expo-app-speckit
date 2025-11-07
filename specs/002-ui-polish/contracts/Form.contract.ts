/**
 * Component Contract: Form Components
 *
 * Purpose: Form progress indicator, inline validation errors, and draft auto-save
 * Location: src/components/forms/
 */

export interface FormProgressProps {
  /**
   * Current step (0-indexed)
   */
  currentStep: number;

  /**
   * Total number of steps
   */
  totalSteps: number;

  /**
   * Optional step labels
   */
  stepLabels?: string[];

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Show step numbers
   * @default true
   */
  showStepNumbers?: boolean;

  /**
   * Show progress percentage
   * @default false
   */
  showPercentage?: boolean;
}

export interface InlineErrorProps {
  /**
   * Error message to display
   * If undefined or null, component renders nothing
   */
  error?: string | null;

  /**
   * Show error icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom icon
   * @default 'alert-circle'
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Error severity (affects color)
   * @default 'error'
   */
  severity?: 'error' | 'warning' | 'info';
}

export interface DraftSaverProps {
  /**
   * Unique identifier for the draft
   */
  draftId: string;

  /**
   * Form data to save
   */
  formData: any;

  /**
   * Auto-save delay in milliseconds
   * @default 2000
   */
  autoSaveDelay?: number;

  /**
   * Callback when draft is saved
   */
  onSaved?: (timestamp: number) => void;

  /**
   * Callback when draft save fails
   */
  onError?: (error: Error) => void;

  /**
   * Should show save indicator
   * @default true
   */
  showIndicator?: boolean;
}

/**
 * Example Usage - Form Progress:
 *
 * ```tsx
 * import { FormProgress } from '@/components/forms/FormProgress';
 *
 * function MultiStepForm() {
 *   const [currentStep, setCurrentStep] = useState(0);
 *
 *   return (
 *     <View>
 *       <FormProgress
 *         currentStep={currentStep}
 *         totalSteps={4}
 *         stepLabels={['Type', 'Duration', 'Details', 'Review']}
 *       />
 *       {renderStepContent(currentStep)}
 *     </View>
 *   );
 * }
 * ```
 *
 * Example Usage - Inline Error:
 *
 * ```tsx
 * import { InlineError } from '@/components/forms/InlineError';
 *
 * function FormField() {
 *   const [value, setValue] = useState('');
 *   const [error, setError] = useState<string>();
 *
 *   const validate = () => {
 *     if (value.length < 3) {
 *       setError('Must be at least 3 characters');
 *     } else {
 *       setError(undefined);
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       <TextInput
 *         value={value}
 *         onChangeText={setValue}
 *         onBlur={validate}
 *       />
 *       <InlineError error={error} />
 *     </View>
 *   );
 * }
 * ```
 *
 * Example Usage - Draft Saver:
 *
 * ```tsx
 * import { DraftSaver } from '@/components/forms/DraftSaver';
 * import { useDraftForm } from '@/hooks/useDraftForm';
 *
 * function ExposureForm() {
 *   const [formData, setFormData] = useState<ExposureDraft>(initialData);
 *   const { loadDraft, clearDraft } = useDraftForm('exposure_new', formData);
 *
 *   useEffect(() => {
 *     loadDraft().then(draft => {
 *       if (draft) setFormData(draft);
 *     });
 *   }, []);
 *
 *   const handleSubmit = async () => {
 *     await submitExposure(formData);
 *     await clearDraft(); // Clear draft on successful submit
 *   };
 *
 *   return (
 *     <View>
 *       <DraftSaver
 *         draftId="exposure_new"
 *         formData={formData}
 *         onSaved={(ts) => console.log('Saved at', ts)}
 *       />
 *       {/* Form fields */}
 *     </View>
 *   );
 * }
 * ```
 */
