import { isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import FilloutApiService from '../../services/fillout-api-service.ts';

export enum QuestionType {
  Address = 'Address',
  AudioRecording = 'AudioRecording',
  Calcom = 'Calcom',
  Calendly = 'Calendly',
  Captcha = 'Captcha',
  Checkbox = 'Checkbox',
  Checkboxes = 'Checkboxes',
  ColorPicker = 'ColorPicker',
  CurrencyInput = 'CurrencyInput',
  DatePicker = 'DatePicker',
  DateRange = 'DateRange',
  DateTimePicker = 'DateTimePicker',
  Dropdown = 'Dropdown',
  EmailInput = 'EmailInput',
  FileUpload = 'FileUpload',
  ImagePicker = 'ImagePicker',
  LocationCoordinates = 'LocationCoordinates',
  LongAnswer = 'LongAnswer',
  Matrix = 'Matrix',
  MultiSelect = 'MultiSelect',
  MultipleChoice = 'MultipleChoice',
  NumberInput = 'NumberInput',
  OpinionScale = 'OpinionScale',
  Password = 'Password',
  Payment = 'Payment',
  PhoneNumber = 'PhoneNumber',
  Ranking = 'Ranking',
  RecordPicker = 'RecordPicker',
  ShortAnswer = 'ShortAnswer',
  Signature = 'Signature',
  Slider = 'Slider',
  StarRating = 'StarRating',
  Switch = 'Switch',
  TimePicker = 'TimePicker',
  URLInput = 'URLInput'
}

export interface Question {
  id: string;
  name: string;
  type: QuestionType;
  value: string | number;
}

type Submission = {
  submissionId: string;
  submissionTime: string;
  lastUpdatedAt: string;
  questions: Question[];
};

export type SubmissionResponse = {
  responses: Submission[];
  totalResponses: number;
  pageCount: number;
};

export type FilterClauseType = {
  id: string;
  condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
  value: number | string;
};

export type QueryParams = {
  limit?: string;
  afterDate?: string;
  beforeDate?: string;
  offset?: string;
  status?: 'finished' | 'in_progress';
  includeEditLink?: boolean;
  sort?: 'asc' | 'desc';
};

const DEFAULT_PAGE_SIZE = 10;

export default class FormService {
  public static fetchFilteredResponses = async (
    formId: string,
    filters: FilterClauseType[],
    queryParams: QueryParams
  ): Promise<SubmissionResponse> => {
    try {
      const { data } = await FilloutApiService.axiosInstance.get<SubmissionResponse>(
        `/v1/api/forms/${formId}/submissions`,
        { params: queryParams }
      );

      const filterMap = new Map(filters.map((filter) => [filter.id, filter]));

      const filteredResponses = data.responses.filter((submission) => {
        let meetsAllFilters = true;

        for (const question of submission.questions) {
          const filter = filterMap.get(question.id);
          if (!filter) continue; // No filter for this question, skip it

          const questionValue = question.value;
          const filterValue = filter.value;

          let meetsFilter = false;

          if (typeof questionValue === 'string' && typeof filterValue === 'string') {
            const questionDate = parseISO(questionValue);
            const filterDate = parseISO(filterValue);

            if (!isNaN(questionDate.getTime()) && !isNaN(filterDate.getTime())) {
              switch (filter.condition) {
                case 'equals':
                  meetsFilter = isEqual(questionDate, filterDate);
                  break;
                case 'does_not_equal':
                  meetsFilter = !isEqual(questionDate, filterDate);
                  break;
                case 'greater_than':
                  meetsFilter = isAfter(questionDate, filterDate);
                  break;
                case 'less_than':
                  meetsFilter = isBefore(questionDate, filterDate);
                  break;
              }
            }
          }

          // Fallback to string and numbers
          if (!meetsFilter) {
            switch (filter.condition) {
              case 'equals':
                meetsFilter = questionValue == filterValue;
                break;
              case 'does_not_equal':
                meetsFilter = questionValue != filterValue;
                break;
              case 'greater_than':
                meetsFilter = +questionValue > +filterValue;
                break;
              case 'less_than':
                meetsFilter = +questionValue < +filterValue;
                break;
            }
          }

          // If any question doesn't meet its filter, the whole submission doesn't meet the criteria
          if (!meetsFilter) {
            meetsAllFilters = false;
            break;
          }
        }

        return meetsAllFilters;
      });

      const limit = queryParams.limit ? +queryParams.limit : DEFAULT_PAGE_SIZE;
      const totalResponses = filteredResponses.length;
      const pageCount = Math.ceil(totalResponses / limit);

      return { ...data, responses: filteredResponses, totalResponses, pageCount };
    } catch (error) {
      console.error('Error in fetchFilteredResponses:', error);
      throw error;
    }
  };
}
