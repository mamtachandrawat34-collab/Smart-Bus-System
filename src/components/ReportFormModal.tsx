import { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import type { CrowdLevel, TravelPeriod } from '@/types';
import { busRoutes, pickableStopsForRoute } from '@/data/routes';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FieldWrapper, Select, TextArea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';

interface ReportFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

interface FormErrors {
  routeNumber?: string;
  stopName?: string;
  travelPeriod?: string;
  crowdLevel?: string;
}

const CROWD_OPTIONS: CrowdLevel[] = ['Low', 'Medium', 'High'];
const PERIOD_OPTIONS: TravelPeriod[] = ['Morning', 'Afternoon', 'Evening'];

export function ReportFormModal({
  open,
  onClose,
  onSubmitted,
}: ReportFormModalProps) {
  const { addReport } = useApp();
  const { pushToast } = useToast();

  const [routeNumber, setRouteNumber] = useState<number | ''>('');
  const [stopName, setStopName] = useState('');
  const [travelPeriod, setTravelPeriod] = useState<TravelPeriod | ''>('');
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel | ''>('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset everything when the modal closes.
  useEffect(() => {
    if (!open) {
      setRouteNumber('');
      setStopName('');
      setTravelPeriod('');
      setCrowdLevel('');
      setDescription('');
      setErrors({});
      setTouched(false);
    }
  }, [open]);

  const availableStops = useMemo(
    () => (routeNumber ? pickableStopsForRoute(routeNumber) : []),
    [routeNumber]
  );

  const selectedRoute = useMemo(
    () => busRoutes.find((r) => r.routeNumber === routeNumber),
    [routeNumber]
  );

  // When the route changes, reset the stop selection and clear its error.
  const handleRouteChange = (value: string) => {
    setRouteNumber(value === '' ? '' : Number(value));
    setStopName('');
    if (errors.stopName) {
      setErrors((e) => ({ ...e, stopName: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (routeNumber === '' || !selectedRoute) {
      next.routeNumber = 'Please select a bus route.';
    }
    // Stop is required when the route has pickable stops.
    if (selectedRoute && availableStops.length > 0 && !stopName) {
      next.stopName = 'Please select a stop for this route.';
    }
    if (!travelPeriod) {
      next.travelPeriod = 'Please choose a travel period.';
    }
    if (!crowdLevel) {
      next.crowdLevel = 'Please select a crowd level.';
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setTouched(true);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (!selectedRoute || !crowdLevel || !travelPeriod) return;

    setSubmitting(true);
    const res = await addReport({
      routeNumber: selectedRoute.routeNumber,
      routeName: selectedRoute.routeName,
      stopName: stopName || 'Not specified',
      travelPeriod,
      crowdLevel,
      description,
    });
    setSubmitting(false);

    if (res.error) {
      pushToast({
        variant: 'error',
        title: 'Could not submit report',
        message: res.error,
      });
      return;
    }

    pushToast({
      variant: 'success',
      title: 'Report submitted',
      message: `Your ${crowdLevel.toLowerCase()} crowd report for ${selectedRoute.routeName} was recorded.`,
    });

    onSubmitted?.();
    onClose();
  };

  // Live-clear an error once the user fixes the field.
  const revalidate = () => {
    if (touched) setErrors(validate());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report Bus Crowd"
      description="Share what you experienced on your college bus. This is a student-submitted observation, not verified official information."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            <Send size={16} />
            {submitting ? 'Submitting…' : 'Submit Report'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FieldWrapper
          label="Bus Route"
          htmlFor="route"
          required
          error={errors.routeNumber}
          hint="Select the route you travelled on."
        >
          <Select
            id="route"
            value={routeNumber === '' ? '' : String(routeNumber)}
            onChange={(e) => handleRouteChange(e.target.value)}
            onBlur={revalidate}
            aria-invalid={!!errors.routeNumber}
          >
            <option value="">Select a route…</option>
            {busRoutes.map((r) => (
              <option key={r.routeNumber} value={r.routeNumber}>
                {r.routeName}
              </option>
            ))}
          </Select>
        </FieldWrapper>

        <FieldWrapper
          label="Bus Stop"
          htmlFor="stop"
          required={availableStops.length > 0}
          error={errors.stopName}
          hint={
            availableStops.length === 0
              ? 'Choose a route first to see its stops.'
              : `${availableStops.length} stops available on this route.`
          }
        >
          <Select
            id="stop"
            value={stopName}
            onChange={(e) => {
              setStopName(e.target.value);
              revalidate();
            }}
            disabled={availableStops.length === 0}
            aria-invalid={!!errors.stopName}
          >
            <option value="">Select a stop…</option>
            {availableStops.map((s) => (
              <option key={s.stopName} value={s.stopName}>
                {s.stopName}
                {s.verificationStatus === 'needs_verification'
                  ? ' (needs verification)'
                  : ''}
              </option>
            ))}
          </Select>
        </FieldWrapper>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper
            label="Travel Period"
            htmlFor="period"
            required
            error={errors.travelPeriod}
          >
            <Select
              id="period"
              value={travelPeriod}
              onChange={(e) => {
                setTravelPeriod(e.target.value as TravelPeriod);
                revalidate();
              }}
              aria-invalid={!!errors.travelPeriod}
            >
              <option value="">Select period…</option>
              {PERIOD_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </FieldWrapper>

          <FieldWrapper
            label="Crowd Level"
            htmlFor="crowd"
            required
            error={errors.crowdLevel}
            hint="How crowded was the bus?"
          >
            <Select
              id="crowd"
              value={crowdLevel}
              onChange={(e) => {
                setCrowdLevel(e.target.value as CrowdLevel);
                revalidate();
              }}
              aria-invalid={!!errors.crowdLevel}
            >
              <option value="">Select level…</option>
              {CROWD_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FieldWrapper>
        </div>

        {crowdLevel && (
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            Selected crowd level:{' '}
            <Badge
              variant={
                crowdLevel === 'High'
                  ? 'danger'
                  : crowdLevel === 'Medium'
                  ? 'warning'
                  : 'success'
              }
            >
              {crowdLevel}
            </Badge>
          </div>
        )}

        <FieldWrapper
          label="Description (optional)"
          htmlFor="desc"
          hint="Add a short note about what you saw (e.g. standing room only, no seat)."
        >
          <TextArea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            placeholder="e.g. Bus was full by the second stop, many students standing."
          />
        </FieldWrapper>
        <p className="text-right text-xs text-gray-400">
          {description.length}/300
        </p>
      </form>
    </Modal>
  );
}
