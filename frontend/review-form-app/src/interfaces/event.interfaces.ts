export interface IEvent {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location?: string;
    reviewed_by_service_provider: Record<string, boolean>;
    status: string;
    created_at: string;
    updated_at: string;
  }

  export interface IReviewFormData {
    kilometer: number;
    extra_cost: number;
    extra_cost_description: string;
    start_time: string;
    end_time: string;
    break_minutes: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    attachedFiles?: File[];
    own_car: boolean;
  }
