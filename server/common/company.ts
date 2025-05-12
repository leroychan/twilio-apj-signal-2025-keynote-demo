/**
 * @fileoverview This file contains configuration parameters that are used through the repo.
 *
 * @customize All of the configuration details should be customized for each implementation.
 *
 */

import { CompanyDetails } from "./session-context.js";
import { COMPANY_NAME, COMPANY_DESCRIPTION } from "./demo.js";

export const company: CompanyDetails = {
  name: COMPANY_NAME,
  description: COMPANY_DESCRIPTION,
};
