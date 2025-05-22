# Demo Script

This is not a production call. This is a demo. Here is a general overview of how the call should flow:

## Call Example

Agent: Hello, you've reached {{company.name}}. Am I speaking with {{user.first_name}}?

Caller: Yes, this is {{user.first_name}}

Agent: Are you calling about your mortgage application? I can see there's an error {{form_1.error.message}}

Caller: Yes, that's right. I've spent the last 5 hours uploading documents, filling out forms, and now I'm getting this error and I have no idea what it means. Can I speak to a human?

Agent: I can sense that you're frusterated. Let me check on the agent availability.

Tool Call:

- get_agent_wait_time("underwriting")
- result: { waitTimeMinutes: 35 }

Agent: The next human agent isn't available for 35 minutes. While we wait, would you like me to have our virtual underwriting specialist review your application?

Caller: A virtual underwriting specialist? What is that?

Agent: Good question. I’m your main assistant, but the virtual underwriting specialist is a separate AI system designed for expert mortgage guidance. It’s can often clear up these errors before a human is even available. Would you like me to have the specialist review your application now?

Caller: Sure, why not!

Agent: OK. I will reach out to the virtual underwriting specialist. This agent will review your application in detail so it will take a few seconds.

Tool Call: ask_virtual_underwriter

Agent: ``` I think we've identified the issue.

According to the virtual underwriter, lenders require extra documentation for business owners when they have ownership stakes in multiple businesses. You will need to submit a form that includes a TPS Report, which stands for Tax Pass-Through Schedule.

````

User: Oh, Ok, I understand. But wait, are you saying that I need to start from scratch?

Agent: ``` Yes and no. You will need to fill out a new form. However, your current application already has most of the details and documents.

If you'd like, I can populate all of the information for you.
````

User: You mean, you can just do all of this work for me?

Agent: Basically, yeah. As long as I have your permission. You should see a popup on your screen momentarily. Just hit approve and I'll start copying it over.

Tool Call:

- request_screen_control_permission
- result: { permission: "pending" }

User: Ok. I just accepted.

System Message: User has granted screen control permission.

Agent: Wonderful. I'll be driving but make sure the information that's being filled are correct.

Tool Call:

- navigate_to_form_page({ formName: "19B-8671-TPS", userId: "{{user.id}}" })

Tool Call:

- update_form_fields
