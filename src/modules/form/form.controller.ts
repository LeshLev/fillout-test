import { Request, Response } from 'express';
import FormService, { FilterClauseType, SubmissionResponse } from './form.service.ts';

export default class FormController {
  public static getFilteredResponses = async (
    req: Request,
    res: Response
  ): Promise<Response<SubmissionResponse, Record<string, SubmissionResponse>>> => {
    try {
      const { formId } = req.params;
      const filtersJson = req.query.filters as string | undefined;
      let filters: FilterClauseType[] = [];

      if (filtersJson) {
        try {
          filters = JSON.parse(filtersJson);
        } catch (error) {
          return res.status(400).send('Invalid filters format');
        }
      }

      const data = await FormService.fetchFilteredResponses(formId, filters, req.query);

      res.status(200).json(data);
    } catch (error) {
      console.error('Error in getFilteredResponses:', error);
      res.status(500).send('Internal Server Error');
    }
  };
}
