import { Resource } from "sst";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(Resource.SendgridApiKey.value);

export const ORG_INVITE_TEMPLATE_ID = "d-593d3287b4704165b0d8b0bc441588d6";
export const NO_REPLY_EMAIL_ADDRESS = "no-reply@stacks-ils.com";

export default sendgrid;
