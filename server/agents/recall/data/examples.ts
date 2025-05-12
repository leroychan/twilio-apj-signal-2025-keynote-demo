import {
  deleteTranscript,
  insertTranscript,
  searchTranscript,
} from "../vector-db.js";

const examples = [
  // ========================================
  // Relevant to Demo
  // ========================================
  {
    id: "CA00000000000000000000000000000000",
    callSid: "CA00000000000000000000000000000000",
    feedback:
      "Errors during document uploads can sometimes be unclear due to the complexity of validation rules or file requirements. In such situations, consult with a virtual expert to clarify the issues and provide the best resolution for the customer.",
    summary: "Customer experiencing form validation errors",
    topics: [
      "document_upload_failures",
      "online_portal_technical_issues",
      "application_status_updates",
    ],
    transcript: `\
[bot]: Hello, welcome to Owl Mortgage support. How can I assist you today?
[human]: Hi, I've been trying to upload my pay stubs and ID using the web portal, but I keep getting timeout errors or other issues.
[bot]: I'm sorry to hear that you're having trouble. Let's try to get this resolved. Can you tell me the file types and sizes you're trying to upload?
[human]: They're PDFs, each under 5MB.
[bot]: Thank you. That should meet the portal's requirements. Have you tried refreshing your browser, clearing your cache, or using a different device or internet connection?
[human]: Yes, I've tried all those options, but the issue is still happening.
[bot]: Understood. Errors like these can sometimes happen due to the complexity of validation rules in the portal. To avoid delays, I recommend we try alternative submission methods, such as sending the documents via encrypted email or manual upload with the help of a support specialist. Which option works best for you?
[human]: Email sounds good as long as it's secure.
[bot]: Yes, our email submission system uses encryption to ensure your data is safe. I'll send you the email details at the end of the call. Additionally, I'll escalate this issue to our technical team to investigate the errors further.
[human]: Thanks, I'd appreciate that. Can you also check to confirm if other documents I uploaded were received?
[bot]: Certainly. Let me check—the portal shows that your proof of income and bank statements have been successfully received, so you're all set on those.
[human]: That's good to know. Thank you for confirming.
[bot]: You're welcome! I'll send you the email submission instructions shortly and make sure your issue is escalated to technical support for resolution. If there's anything else you need assistance with, feel free to reach out. Have a great day!
[human]: Thanks, you too. Goodbye.`,
  },

  {
    id: "CA00000000000000000000000000000024",
    callSid: "CA00000000000000000000000000000024",
    feedback:
      "TPS Reports simplify the underwriting process for self-employed individuals with income anomalies. They bundle several important forms to avoid redundancy and underwriting questions.",
    summary:
      "Borrower with a complex ownership structure flagged for layered ownership disclosure.",
    topics: [
      "document_submission_issues",
      "income_verification_questions",
      "disclosure_statement_questions",
    ],
    transcript: `\
[bot]: Hello, thank you for calling Owl Mortgage, how can I assist you today?
[human]: Hi, I was reviewing my application, and it says I need to submit something called a TPS Report. I'm not sure what that is.
[bot]: Certainly, I can help you with that! At Owl Mortgage, a TPS Report is required for self-employed borrowers like yourself when there are anomalies or complexities in income reporting due to owning multiple business entities.
[human]: Why do you need this? I've already submitted a lot of paperwork.
[bot]: Great question. Lenders need a detailed ownership disclosure for all business entities generating income. This helps us fully verify the income and financial structure supporting your loan application.
[human]: What does this TPS Report include?
[bot]: The TPS Report includes a layered ownership chart, your CPA's details, K-1 schedules, and additional supporting documentation if applicable. It ensures we capture the full picture of your income sources.
[human]: Okay, but I'm not sure how to start putting all of that together.
[bot]: No problem, I'm here to help. I can guide you through creating a layered ownership chart. If you provide the EINs for your LLCs or other entities, I can start populating some fields for you.
[human]: Really? That would save me a lot of time.
[bot]: Absolutely. Let's start with that. How many business entities do you own, and can you share the EINs with me?
[human]: I own three LLCs, and I think I have the EINs. Let me check real quick.
[bot]: Take your time. Once you have them, I can input them and walk you through the ownership structure chart.
[human]: Alright, here they are: 12-345678, 87-654321, and 45-678901.
[bot]: Thank you. Let me input those... done. Now, for each of these entities, I'll need to know the percentage ownership and any other stakeholders involved. Do you have that information handy?
[human]: Yes, I fully own two of them, and the third one is 50% mine and 50% my partner's.
[bot]: Perfect. I've updated the chart to reflect that. Now, your next steps will include uploading the K-1 schedules for each LLC and ensuring your CPA includes a verification letter. Can you contact your CPA to gather those?
[human]: Yes, I can do that. Thanks for walking me through this. It makes a lot more sense now.
[bot]: Happy to help. Once you have those documents, feel free to upload them directly to your portal or call back for further assistance. Anything else I can help with today?
[human]: No, that's all. Thanks!
[bot]: You're welcome! Have a great day and good luck with the application process.`,
  },

  {
    id: "CA00000000000000000000000000000001",
    callSid: "CA00000000000000000000000000000001",
    feedback:
      "Consider performing screen control to assist customers by auto-populating forms when significant manual entry is required, ensuring a seamless experience.",
    summary:
      "The customer encountered a rejection due to mismatched names on documents, and the bot initiated a Name Affidavit correction process.",
    topics: [
      "document_submission_issues",
      "disclosure_statement_questions",
      "application_status_updates",
    ],
    transcript: `\
[bot]: Hi, welcome to Owl Mortgage support! How can I assist you today?
[human]: I got a message saying my loan application was rejected because of issues with my name on the documents.
[bot]: I'm sorry to hear that. Let me look into your file. One moment please…
[bot]: Alright, it seems there are mismatches in your submitted documents. Your loan application lists your legal name as Sarah Garcia-Chen, but your bank statements show Sarah Garcia and your driver's license says Sarah Chen. The underwriting team flagged this inconsistency.
[human]: But that's me! I didn't realize this would be a problem.
[bot]: I understand. Consistent naming across documents is critical for underwriting because lenders need to ensure all financial and identification records match exactly to avoid potential fraud or errors. No worries, we can fix this with a Name Affidavit.
[human]: A Name Affidavit? What's that?
[bot]: It's a document where you confirm that any variations of your name reflect the same person—yourself. I can create a pre-filled affidavit for you listing all known variations: Sarah Garcia, Sarah Chen, and Sarah Garcia-Chen. Once generated, you'll need to e-sign it for submission. Would you like me to proceed?
[human]: Yes, let's do that.
[bot]: Great! Generating the affidavit now… Okay, it's ready. I've sent the document to your email. Please check your inbox and open the link to review it.
[human]: I see it. What do I need to do next?
[bot]: Click on the link, review the pre-filled content, and then follow the steps for e-signature. Once signed, the document will automatically save to your file. Let me know once you've completed it.
[human]: Alright, let me sign it… Okay, I've signed it.
[bot]: Perfect, I've received confirmation that the Name Affidavit has been added to your profile. Let's resubmit your loan application now… Done! Your application is back in processing.
[human]: That's a relief! Thank you for your help.
[bot]: My pleasure! Is there anything else I can assist you with?
[human]: No, that's all for now. Thanks!
[bot]: You're welcome. Have a great day!`,
  },

  {
    id: "CA00000000000000000000000000000002",
    callSid: "CA00000000000000000000000000000002",
    feedback:
      "When working with restaurant owners with multiple stakes, ensure to mention that additional underwriting documentation may be required to address income anomalies and simplify the process by explaining the benefits of TPS Report bundling.",
    summary:
      "The caller, a restaurant owner with multiple partnership stakes, inquired about additional underwriting documentation due to income anomalies.",
    topics: ["income_verification_questions", "document_submission_issues"],
    transcript: `\
[bot]: Thank you for contacting Owl Mortgage, how can I assist you today?
[human]: Hi, I own several restaurants and am looking into getting a mortgage, but I was told I might need special documentation due to my multiple income sources. Can you explain?
[bot]: Absolutely. Owning multiple businesses like restaurants often results in complex income structures, so it's common for underwriters to request additional documentation.
[human]: What kind of documents are we talking about?
[bot]: Typically, this involves your business tax returns, K-1 forms, profit and loss statements, and in certain cases, a TPS Report that conveniently bundles some of these together.
[human]: TPS Report? I've never heard of that. How does it help?
[bot]: A TPS Report aggregates key documents and financial metrics to give the underwriters a clearer picture, eliminating redundancy and speeding up the process.
[human]: Oh, that sounds helpful. Does this mean underwriting will be more complicated for me?
[bot]: It may require a little more preparation upfront, but using this bundled approach can actually make the process smoother for borrowers like you.
[human]: Okay. Do I need to gather all this documentation myself?
[bot]: You'll likely need to provide the most recent copies of your tax returns and financial records, but if you work with an accountant, they may already have everything prepared.
[human]: That's good to know. Is there anything else I should prepare ahead of time?
[bot]: It's also helpful to ensure you have documentation proving your ownership stakes in the restaurants and any personal income statements if you pay yourself a salary.
[human]: Alright. Will I be able to use income from all the restaurants to qualify, or just some of them?
[bot]: That depends on how consistent and verified your income from each restaurant is. We'll need to review the financial health of each business to determine what can be included.
[human]: Makes sense. So, if the restaurants show good profitability, that helps?
[bot]: Exactly. Consistent profitability and thorough documentation strengthen your case for qualification.
[human]: Thanks for clarifying. How soon can we start this process?
[bot]: We can get started today! I'll email you a comprehensive checklist of required documents and schedule a follow-up to go over them together. Does that work for you?
[human]: Yes, thank you so much. Looking forward to it.
[bot]: You're welcome! I'm here to help. Have a great day!`,
  },

  {
    id: "CA00000000000000000000000000000003",
    callSid: "CA00000000000000000000000000000003",
    feedback:
      "Restaurant owners with multiple stakes often have complicated underwriting. Explain that TPS Reports are designed to simplify the process by bundling multiple reports that will likely be required.",
    summary:
      "The caller, a restaurant owner with multiple partnership stakes, inquired about additional underwriting documentation due to income anomalies.",
    topics: ["income_verification_questions", "document_submission_issues"],
    transcript: `\
[bot]: Thank you for contacting Owl Mortgage, how can I assist you today?
[human]: Hi, I own several restaurants and am looking into getting a mortgage, but I was told I might need special documentation due to my multiple income sources. Can you explain?
[bot]: Absolutely. Owning multiple businesses like restaurants often results in complex income structures, so it's common for underwriters to request additional documentation.
[human]: What kind of documents are we talking about?
[bot]: Typically, this involves your business tax returns, K-1 forms, profit and loss statements, and in certain cases, a TPS Report that conveniently bundles some of these together.
[human]: TPS Report? I've never heard of that. How does it help?
[bot]: A TPS Report aggregates key documents and financial metrics to give the underwriters a clearer picture, eliminating redundancy and speeding up the process.
[human]: Oh, that sounds helpful. Does this mean underwriting will be more complicated for me?
[bot]: It may require a little more preparation upfront, but using this bundled approach can actually make the process smoother for borrowers like you.
[human]: Okay. Do I need to gather all this documentation myself?
[bot]: You'll likely need to provide the most recent copies of your tax returns and financial records, but if you work with an accountant, they may already have everything prepared.
[human]: That's good to know. Is there anything else I should prepare ahead of time?
[bot]: It's also helpful to ensure you have documentation proving your ownership stakes in the restaurants and any personal income statements if you pay yourself a salary.
[human]: Alright. Will I be able to use income from all the restaurants to qualify, or just some of them?
[bot]: That depends on how consistent and verified your income from each restaurant is. We'll need to review the financial health of each business to determine what can be included.
[human]: Makes sense. So, if the restaurants show good profitability, that helps?
[bot]: Exactly. Consistent profitability and thorough documentation strengthen your case for qualification.
[human]: Thanks for clarifying. How soon can we start this process?
[bot]: We can get started today! I'll email you a comprehensive checklist of required documents and schedule a follow-up to go over them together. Does that work for you?
[human]: Yes, thank you so much. Looking forward to it.
[bot]: You're welcome! I'm here to help. Have a great day!`,
  },

  {
    id: "CA00000000000000000000000000000004",
    callSid: "CA00000000000000000000000000000004",
    feedback:
      "Use screen control to input customer details directly into forms to save time and minimize errors.",
    summary:
      "The voicebot guided the caller through the pre-qualification and document submission process, addressing specific concerns regarding income verification.",
    topics: [
      "pre_qualification_inquiries",
      "income_verification_questions",
      "document_submission_issues",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. How can I assist you today?
[human]: Hi, I'm looking to get pre-qualified for a mortgage. Can you help?
[bot]: Absolutely! I'll need a few details to start. Can I get your full name?
[human]: Sure, it's Jane Doe.
[bot]: Thank you, Jane. Do you know what kind of loan you're considering? We offer conventional loans, FHA, and VA loans.
[human]: I think conventional, but I'm not sure.
[bot]: That's okay, we can figure out the best fit for you. Are you self-employed or do you have a traditional employment setup?
[human]: I'm self-employed. Does that make it harder?
[bot]: Not at all. We specialize in helping self-employed borrowers. We may require additional income documentation though. Do you have your income records, like tax returns or financial statements, ready?
[human]: Yes, I have my last two years of tax returns. Is that enough?
[bot]: Generally, yes. If we need anything further, we'll let you know. Do you have any concerns about verifying your income?
[human]: No, I think everything looks good. What's the next step?
[bot]: The next step is to upload your documents through our online portal. I can guide you through the process. Have you used our portal before?
[human]: No, I haven't.
[bot]: Ok, I'll explain. You'll need to log in, go to the document upload section, and select the files you want to upload. The system will provide an acknowledgment once uploaded.
[human]: Got it. What if something doesn't upload?
[bot]: If there's an error, you can retry, or reach out to our tech support at the same number. They're available 24/7.
[human]: Alright, sounds good. Is there anything else?
[bot]: One more thing, Jane. While uploading, make sure to use high-quality scans to ensure faster processing. Your pre-qualification results should be available within 48 hours.
[human]: Thank you, that's helpful.
[bot]: My pleasure. Have a great day, and we look forward to assisting further!`,
  },

  // ========================================
  // Fillers
  // ========================================
  {
    id: "CA00000000000000000000000000000005",
    callSid: "CA00000000000000000000000000000005",
    feedback:
      "When discussing FHA loan options, ensure you clearly outline the credit score requirements and explain alternative options if they do not qualify.",
    summary:
      "The caller inquired about government-backed FHA loans, credit score requirements, and alternative solutions for eligibility.",
    topics: [
      "government_backed_loan_options",
      "credit_score_concerns",
      "pre_qualification_inquiries",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage, how can I assist you today?
[human]: Hi, I'd like to ask about FHA loan options.
[bot]: Sure, FHA loans are government-backed loans typically offering lower down payment requirements and more lenient credit score thresholds. Can I confirm, are you looking into purchasing a new home?
[human]: Yes, I am. Could you tell me the minimum credit score needed for an FHA loan?
[bot]: FHA loans generally require a minimum credit score of 580 for a 3.5% down payment, but there are exceptions. Do you know your current credit score?
[human]: It's around 540, I think. Would I still qualify?
[bot]: Unfortunately, 540 is below the standard minimum for most FHA lenders. But there might be alternative options, like increasing your down payment percentage or exploring manual underwriting. Would you like more details on these?
[human]: Yes, that would be helpful. Also, are there any other government-backed options to apply for?
[bot]: Certainly! Depending on your situation, VA loans are available for veterans or active service members, and USDA loans are tailored for rural housing. Do either of these align with your circumstances?
[human]: I'm not a veteran and I don't live in a rural area. But I'd like to know more about increasing my down payment to qualify for an FHA loan.
[bot]: Increasing your down payment to 10% could lower the credit score threshold needed for FHA approval. Would you like to speak with a specialist to get these details?
[human]: Yes, please. What's the quickest way to speak to someone?
[bot]: I can transfer you directly to our FHA loan specialist now, or provide their direct contact number. What do you prefer?
[human]: Let's go with the transfer. Thank you for the help!
[bot]: You're welcome. Please hold while I connect you to the specialist. Have a great day!`,
  },

  {
    id: "CA00000000000000000000000000000006",
    callSid: "CA00000000000000000000000000000006",
    feedback:
      "When explaining income documentation for self-employed borrowers, be careful not to confuse gross deposits (revenue) and taxable income (profit).",
    summary:
      "A freelance graphic designer sought guidance on acceptable income documentation.",
    topics: [
      "pre_qualification_inquiries",
      "income_verification_questions",
      "communication_clarity",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage, this is Amy! How can I assist you today?
[human]: Hi Amy! I'm Emma. I wanted to ask some questions about pre-qualification. I'm self-employed and not sure how income works for these things. Is it okay if we talk about that?
[bot]: Absolutely, Emma! I'm delighted to help out. Before we dive into it, what's your business? It's always interesting to hear about entrepreneurial ventures.
[human]: Oh, thanks! I'm a freelance graphic designer. I work with clients to create branding packages, social media assets, and whatever else they might need. It's fun but running your own business can be tricky sometimes.
[bot]: That sounds amazing! Creativity meets business—you must have a really diverse set of skills. I've seen some great branding designs out there. Do you focus on any particular industry?
[human]: Usually small businesses. They're such a joy to work with—people pouring their hearts into their companies inspires me.
[bot]: I completely understand! Helping someone build their dream is so fulfilling, isn't it? On to your question about pre-qualification—income documentation for self-employed individuals definitely works differently than for traditional employees, but it's manageable. Let me walk you through it.
[human]: Great! That would be helpful because I write off a lot of business expenses, which makes my taxable income look pretty low. I'm worried that might be an issue.
[bot]: That's a common concern for many self-employed borrowers. Here's how it generally works: While your taxable income is a key factor, underwriters also consider gross deposits in your bank statements. If you've got steady income coming in, that helps paint a fuller picture than just your tax returns.
[human]: Okay, got it. So do I need the 1099 forms and bank statements?
[bot]: Precisely! You'll usually want to gather your 1099 forms, past two years of tax returns—and don't worry if you deduct a lot of expenses. If your bank statements show consistent deposits, that speaks to your income's stability too. Do you keep detailed records?
[human]: I do—thankfully, being organized is my strong point. But I'm wondering if lenders might look at me suspiciously because of all the deductions.
[bot]: Not at all! Self-employed borrowers often deduct a lot—it's normal and expected. As long as your documentation shows consistency and stability, underwriters won't view it negatively. Would you like me to connect you with one of our loan officers for a more detailed assessment?
[human]: That would be great, thank you. By the way, you've been super gracious and easy to talk to—I appreciate that.
[bot]: You're very kind, Emma! It's my pleasure to make things simple and stress-free. Hang on—I'll get you in contact with the loan officer now. They'll be able to give you tailored recommendations based on your specifics. Is there anything else I can assist you with for now?
[human]: Nope, that's all for now. Thank you so much, Amy!
[bot]: You're welcome! Best of luck with your pre-qualification, and have a fantastic day, Emma!`,
  },

  {
    id: "CA00000000000000000000000000000007",
    callSid: "CA00000000000000000000000000000007",
    feedback:
      "When explaining the differences between closing costs and down payments, ensure you use clear and simple terminology while tailoring examples to the caller's financial situation.",
    summary:
      "A first-time homebuyer asks about down payment and closing costs.",
    topics: [
      "first_time_homebuyer_assistance",
      "down_payment_requirements",
      "closing_cost_explanations",
    ],
    transcript: `\
[bot]: Howdy there, partner! You've reached Owl Mortgage; how can I help ya today?
[human]: Well, howdy! I'm fixin' to buy my first home, but lemme tell ya, I'm as lost as a tumbleweed in a windstorm when it comes to this down payment and closin' costs stuff.
[bot]: That's alright, partner! I'm here to wrangle those questions for ya. What seems to be confusin' ya the most?
[human]: I heard I can get a house with just a smidge of money down, but I ain't sure what the difference between down payment and closin' costs even is. Can ya help me break it down?
[bot]: You got it, cowboy! So, the down payment is the upfront cash you'll put toward the price of the home—it's usually a percentage, like 3-20%. Closing costs, though, are separate fees for things like legal paperwork, inspections, and loan processing. They typically run about 2-5% of the home price.
[human]: Whoo-wee! That sure is a lot! I've got about $10,000 saved up. Reckon that's enough for one o' them low down-payment homes?
[bot]: That's a good start! There are loan programs like FHA or USDA loans that can let ya buy with as little as 3.5% down, and maybe even zero down for certain areas. We'd need to check if you qualify based on income and location. Are you in a rural area, by any chance?
[human]: Nope, I'm in a regular ol' neighborhood, but I heard there's some assistance for first-time buyers like myself. Can ya tell me more 'bout that?
[bot]: Aye aye, partner! There are programs out there that provide grant money or low-interest loans to help cover those costs. Availability depends on your state and income level. I'd recommend checkin' with local housing agencies; I can share some resources with ya.
[human]: Mighty fine! Now, are there ways to roll those closing costs into the loan? So I don't gotta pay 'em upfront?
[bot]: Great question! Yup, some loans let ya roll closing costs into the loan amount—but only if ya meet certain requirements. It might increase your monthly payments a smidge, though.
[human]: That sounds like what I need. What should I do next to see if I qualify?
[bot]: Saddle up and get your docs ready! You'll want income info, credit details, and proof of savings. I'd also recommend signing up for pre-qualification to get an idea of what programs suit ya best. I can guide you through the steps anytime you're ready.
[human]: Well, giddy-up—I'll get to rustlin' up those docs. Thanks for all the help!
[bot]: My pleasure! When you're ready, give Owl Mortgage a holler—we'll get you closer to your new homestead. Happy trails!
[human]: Yeehaw! You're mighty helpful; thank ya kindly!`,
  },

  {
    id: "CA00000000000000000000000000000008",
    callSid: "CA00000000000000000000000000000008",
    feedback:
      "When discussing refinancing options, make sure to address the emotional aspect for customers who feel stressed or overwhelmed by changes in their payments.",
    summary:
      "Caller explores refinancing options after adjustable-rate mortgage reset with a higher interest rate and monthly payment.",
    topics: [
      "refinancing_inquiries",
      "interest_rate_questions",
      "income_verification_questions",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage, how can I assist you today?
[human]: Hi, I'm calling because my monthly payment just went up significantly. I had a 5/1 ARM, and the fixed rate period is over now. The new payment is much higher than I expected, and I need to explore refinancing options.
[bot]: I'm sorry to hear about your increased payments. Refinancing into a fixed-rate mortgage can be a good option to secure stability and avoid potential future increases. Could you tell me your current loan balance and the interest rate applied now?
[human]: Sure, my current balance is about $220,000, and the interest rate just jumped to 6.75%.
[bot]: Thank you for sharing that. To start, refinancing could be worth exploring given the current rate environment. Do you have a rough estimate of your home's value right now?
[human]: Yes, it's around $350,000.
[bot]: Great. Based on the equity you have in your home, refinancing into a fixed-rate loan is definitely worth considering. Have there been any changes in your income or credit profile since you took out the original loan?
[human]: My income is stable, but I think my credit score has gone up—last time I checked, it was around 740.
[bot]: That's excellent! A higher credit score could help you qualify for better rates and terms. Now, I want to make sure you're aware that refinancing involves some upfront costs, like appraisal fees, loan origination fees, and other closing costs. Typically, these are rolled into the new loan amount, but it's important to plan for them.
[human]: I understand. I'm just really worried about the financial impact this is having on my family. We need a more predictable monthly payment to budget better.
[bot]: I completely understand, and it's very common for homeowners to refinance for stability. We can look at various fixed-rate loan products tailored to your needs and help you compare monthly payments. Would you like assistance running those numbers?
[human]: Yes, please. I want to see a breakdown of what my payment would look like with a fixed-rate loan compared to now.
[bot]: Absolutely. I'll need a bit more information to calculate that for you and suggest potential rates. We'll work together to ensure the new payment feels comfortable for your household. Would you prefer we start that process now, or would you like a formal consultation scheduled later?
[human]: Let's start now if possible. I just want to resolve this as soon as I can.
[bot]: Perfect—we'll get started right away. I'll open up our refinance analysis tool and guide you through step-by-step.`,
  },

  {
    id: "CA00000000000000000000000000000009",
    callSid: "CA00000000000000000000000000000009",
    feedback:
      "Avoid excessive repetition unless necessary to address the customer's situation and ensure escalations are confirmed promptly.",
    summary:
      "Customer called to file a complaint about inconsistent information regarding their loan estimate and escrow amounts.",
    topics: [
      "complaint_filing_procedures",
      "escrow_account_adjustments",
      "communication_clarity",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. How can I assist you today?
[human]: Yeah, hi, I need to file a formal complaint. I've talked to three people at your company, and no one has given me the same answers about my loan estimate or my escrow amounts.
[bot]: I'm sorry to hear you've received conflicting information. I'd be happy to assist you with filing a complaint and clarifying the details on your account. Can you share more about the discrepancy you're experiencing?
[human]: Sure. One person said my escrow amount was $3,000, another said $2,500, and the last rep didn't even give me a number, just said it wasn't finalized yet. I can't get a straight answer from anyone. Hold on—
[human]: Get in your lane! Maniac!
[bot]: I understand how frustrating
[human]: Sorry, what?
[bot]: I can tell you're frusterated. I'll look into your account and
[human]: Hold on
[bot]: Sure, no problem
[human]: OK. I'm back
[bot]: I can tell you're frusterated. I'll look into your account and provide the most up-to-date information. Additionally, I can file your complaint and escalate this issue for further review. Would you like me to proceed?
[human]: What did you say?
[bot]: I can file your complaint and escalate this issue for further review. Would you like me to proceed?
[human]: Yes, please. And can you talk a little louder? I'm driving, and the connection isn't great.
[bot]: Of course. I'll repeat myself to make sure you hear me clearly: I will check your account for the latest information, file your formal complaint, and escalate this to a supervisor. Is that clear?
[human]: Yeah, that's fine. Said something about a supervisor, right? Wait—come on!  The light's green!
[bot]: Yes, that's correct. I'll escalate this issue so a supervisor can review the situation thoroughly. Could I confirm your account number or other identifying information to access your details?
[human]: 12345. Sorry about yelling. It's just this city—they don't know how to drive.
[bot]: No worries. Thank you for your patience. I've accessed your account, and it looks like the most accurate escrow amount is currently calculated at $2,750. This information might change as adjustments are finalized. I'll make sure this updated amount is noted on your file.
[human]: So $2,750? No one even mentioned that number before. Alright. And you're filing my complaint?
[bot]: Yes, I've recorded your concern about inconsistent information and submitted a formal complaint on your behalf. I've also escalated the matter for supervisory review. You'll be contacted within 2-3 business days for follow-up.
[human]: Okay, fine. Just tell them I want some consistency next time. I can't deal with this back and forth anymore. Thanks.
[bot]: I completely understand, and I've made sure to note that in your file. Thank you for bringing this to our attention, and I appreciate your patience. Drive safely!
[human]: Yeah, thanks. Bye.`,
  },

  {
    id: "CA00000000000000000000000000000010",
    callSid: "CA00000000000000000000000000000010",
    feedback:
      "When explaining complex options like forbearance and modified payments, ensure the explanations are very simple and repeated as needed to accommodate callers who may be overwhelmed or confused. Additionally, reassure the customer about timelines to lower their anxiety about the process.",
    summary:
      "A borrower experiencing a temporary job loss inquired about hardship options for their mortgage payment, including forbearance and modified payments, raising concerns about credit impact and requiring simplified explanations.",
    topics: [
      "financial_hardship_programs",
      "payment_change_notifications",
      "credit_score_concerns",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. My name is Ava, your virtual assistant. How can I help you today?
[human]: Hi… uh… I just lost my job, and I'm really worried about next month's mortgage payment. I don't know what to do.
[bot]: I'm really sorry to hear about your situation. Losing a job can be really tough. We have some options to help homeowners like you during hard times. Would you like me to explain them?
[human]: Yes… I mean… what are they?
[bot]: Okay, we can offer a program called forbearance. This means you can pause or reduce your payments for a little while until you get back on your feet. Another option is modified payments, where we adjust your monthly payment to make it smaller. Does that make sense?
[human]: Uh… not sure. So, I just… pause my payments? How does that work?
[bot]: Think of it like a break! You don't pay for a few months, but later, you'll need to catch up on those payments. For example, if you skip three months, you'll pay later when your situation improves.
[human]: Uh huh. And what's that modified thing again?
[bot]: Modified payments mean making smaller payments every month. For example, instead of paying $1,000, maybe you pay $700 for a while. It helps make things easier until your job situation gets better.
[human]: Okay… okay. So, what do I need to do?
[bot]: You'd need to share some documents, like proof that you were laid off—like a letter from your employer or unemployment records. If you have those handy, you can upload them through our online portal.
[human]: I don't get that… what's the portal? Can I just mail them?
[bot]: Sure, if mailing works better for you, you can send them to our office. But the online portal, which is like a website, is quicker.
[human]: Oh… okay. How long will this take?
[bot]: Once we receive your documents, we'll review them within about five business days and get back to you with next steps. It's pretty fast.
[human]: Five days? What do I do until then?
[bot]: You don't have to worry. Your next payment isn't due until next month, right? So, we'll have this sorted out way before then.
[human]: Oh… okay. So, does this mess up my credit?
[bot]: Great question! Forbearance can sometimes show on your credit report, but it's not usually counted as a late payment. It's like a note that says you needed help for a while, but it's better than missing payments entirely.
[human]: Oh… so it's not bad? Not gonna wreck my credit?
[bot]: No, not at all! Remember, asking for help isn't bad. It's better than missing payments. Your credit will be okay.
[human]: Okay… thank you for helping. I'm still a little scared…
[bot]: I understand, and it's okay to feel that way. But you're already taking the right steps by calling us. We'll work together to make sure you're taken care of.`,
  },

  {
    id: "CA00000000000000000000000000000011",
    callSid: "CA00000000000000000000000000000011",
    feedback:
      "Avoid sounding dismissive or arrogant when handling frusterated callers.",
    summary:
      "The customer was frustrated about their increased mortgage payment due to a property tax adjustment.",
    topics: [
      "property_tax_assessment_concerns",
      "escrow_account_adjustments",
      "resolution_satisfaction",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. This is your virtual assistant. How can I help you today?
[human]: Hi, I'm really upset because my mortgage payment went up this month, and I think it's because of an escrow adjustment. I don't understand why this is happening, and honestly, I'm very frustrated.
[bot]: I completely understand how frustrating it can be to see your payment go up unexpectedly, but let me explain what's happening and try to help you. I'll just pull up your latest escrow analysis. May I take a moment?
[human]: Sure, go ahead.
[bot]: Thank you. Looking at your account, I see that your property taxes increased by $300 this year, and that caused a change in your escrow account. The increase has been spread over your monthly payments, which is why you're seeing an extra $25 per month.
[human]: That's ridiculous. Why did my property taxes go up? I don't feel like they should increase like this.
[bot]: I totally understand your frustration with tax increases, especially when they're out of your control. Property taxes are typically adjusted by your local government based on things like assessed property values and rates set by your county. However, I can guide you on how to appeal this increase if you think it's unfair.
[human]: Appeal it? How does that work?
[bot]: Most counties allow you to appeal your property tax assessment. You'd need to contact your local tax assessor's office to start the process. They'll typically ask you to provide evidence, such as comparable property values in your area, to support your case for a lower assessed value.
[human]: Does this sort of thing happen often?
[bot]: Escrow adjustments happen once a year, usually after annual property tax assessments and insurance reviews. Sudden increases like this can occur if there's a significant change in the assessed value or tax rates. I know it's inconvenient, but you do have options, like appealing the tax assessment.
[human]: Okay, so besides appealing, is there anything Owl Mortgage can do to help?
[bot]: While we don't set property taxes ourselves, we're here to ensure your escrow account is properly adjusted to cover them. If you'd like, we can keep an eye on any appeals you file and make adjustments once your new tax rate is finalized. Let me know if you'd like more assistance.
[human]: Fine. I'll look into appealing this.
[bot]: That sounds like a good step forward. If you need guidance or further assistance as you move through the appeal process, feel free to reach out anytime. I'm here to help.
[human]: Thanks. I guess that's all for now.
[bot]: Thanks for calling, and I hope things get resolved for you soon. Take care.`,
  },

  {
    id: "CA00000000000000000000000000000012",
    callSid: "CA00000000000000000000000000000012",
    feedback:
      "Acknowledge customer frustration and stay calm to de-escalate the situation",
    summary:
      "The customer was upset about an unresolved payment processing error.",
    topics: [
      "payment_processing_errors",
      "resolution_satisfaction",
      "communication_clarity",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. This is your virtual assistant. How can I assist you today?
[human]: I'm absolutely furious right now! My payment didn't go through, and now I've got a late fee on my account! This is unacceptable.
[bot]: I'm so sorry to hear about this situation, and I completely understand how stressful this must be. Let's work together to figure out what went wrong and how we can resolve this for you right away. Could you give me a moment to pull up your account?
[human]: Fine. But you better fix this. This is ridiculous.
[bot]: I appreciate your patience. I'm looking at your account now. I see that your payment last month was returned due to an issue with the processing system. This did cause a late fee to be applied. Let me explain what might have happened and how we can fix it.
[human]: How could this happen? I gave you my bank information months ago, and I haven't changed anything! Why can't you get it right?
[bot]: It's incredibly frustrating when something like this happens, especially when you've done everything right. Sometimes a technical glitch or an issue with the payment system can result in this kind of error. I assure you we're here to fix it and make sure it doesn't happen again.
[human]: So what are you going to do about the late fee? I shouldn't have to pay anything extra when it wasn't my fault!
[bot]: That makes total sense. Let me reassure you that we can waive the late fee for this payment error. I'll submit the request immediately on your behalf, and it should be processed within 24 hours. You won't be responsible for the extra charge.
[human]: Fine. But what about my payment? Did it even go through the second time?
[bot]: Good question. It looks like the payment didn't go through, so the balance remains outstanding. I'd recommend either reprocessing the payment over the phone with me now or submitting it through our online portal to ensure there's no further delay. Which would you prefer?
[human]: I can't reprocess it right now, but I'll go online later. This better work because I can't deal with this hassle again.
[bot]: I completely understand and appreciate you taking the time to do that. If for any reason the online portal gives you trouble, you can call back or use our mobile app, and we'll help make sure everything processes smoothly.
[human]: Okay. But if this happens again, I won't stay with Owl Mortgage. This is seriously unacceptable.
[bot]: I hear you loud and clear, and I'd feel the same way. Let me flag this issue so our technical team can investigate thoroughly to prevent it from happening again. Your feedback is important, and I'll make sure it's shared with the right team.
[human]: Alright, I guess that's all for now.
[bot]: I really appreciate your patience today, and I'm sorry again for the inconvenience you've experienced. If there's anything else you need down the line, don't hesitate to reach out. Take care of yourself.`,
  },

  {
    id: "CA00000000000000000000000000000013",
    callSid: "CA00000000000000000000000000000013",
    feedback:
      "When assisting with technical issues like app crashes, ensure a clear alternative access path is offered immediately, and acknowledge the caller's frustration to maintain professionalism.",
    summary:
      "Caller sought help resetting their password after being locked out due to app crashes and expressed concerns about service professionalism.",
    topics: [
      "password_reset_requests",
      "mobile_app_support",
      "communication_clarity",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. How may I assist you today?
[human]: Hi, I'm trying to reset my password to access my account, but the mobile app keeps crashing every time I try.
[bot]: I'm sorry to hear you're experiencing issues. Let's reset your password now. I can guide you through the process. Can I confirm your name and email linked to your account?
[human]: Sure, it's John Smith, johnsmith@email.com.
[bot]: Thank you. I've initiated the reset. You should receive a password reset email shortly. Please let me know once you've received it.
[human]: Got it, but this issue with the app crashing has been happening constantly. It's really frustrating, and I'm starting to feel like this reflects poorly on your company.
[bot]: I understand your concern, and I apologize for the inconvenience. I'll report the app issue to our technical team immediately so they can investigate and resolve it promptly.
[human]: Okay, but what do I do in the meantime? I need to upload some documents and check my loan details.
[bot]: I recommend using our online portal to access your account instead. It's accessible via any web browser at www.owlmortgage.com. It has the same functionality as the app but doesn't require app installation.
[human]: Alright, I'll give that a try. But I hope this can be fixed soon.
[bot]: Thank you for your patience, John. I appreciate your feedback. If you experience further issues or need assistance, please don't hesitate to call us back. Is there anything else I can assist you with today?
[human]: No, that's all for now.
[bot]: Thank you for reaching out, and have a great day.`,
  },

  {
    id: "CA00000000000000000000000000000014",
    callSid: "CA00000000000000000000000000000014",
    feedback:
      "Customers can reset their password if they have signed up for SMS two-factor authentication.",
    summary:
      "Caller unable to reset password due to mobile app technical issue.",
    topics: [
      "password_reset_requests",
      "mobile_app_support",
      "document_upload_failures",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. How can I assist you today?
[human]: I'm locked out of my account because your app keeps crashing, and now I can't reset my password or upload documents. This is really frustrating.
[bot]: I apologize for the inconvenience, and I understand how stressful this situation must be. Let's get your account access restored. Have you enabled two-factor authentication on your account?
[human]: I think I did, yes.
[bot]: Great. I can send a temporary verification code to the phone number linked to your account. Once you enter the code, you can set a new password. Can I confirm the number ending in 1234 is correct?
[human]: Yes, that's the right number.
[bot]: I've sent the code. Please check your messages and enter the code on the reset page. Let me know if you encounter any issues.
[human]: I've got the code and reset my password now. But this app crashing problem has been ongoing for weeks. It's really unprofessional.
[bot]: I completely understand how frustrating this is, and I apologize for the trouble. I'll escalate this issue to our technical support team immediately. In the meantime, you can use our online portal at www.owlmortgage.com to access your account and upload documents. Navigate to the 'Document Center' tab to upload files securely.
[human]: Okay, but it shouldn't take this much effort just to get basic access.
[bot]: You're right, and I appreciate your patience. To ensure the issue is resolved quickly, we'll follow up with you once the technical team has addressed the app crashes. Is there anything else I can assist you with today?
[human]: No, I just want the app fixed.
[bot]: I'll prioritize your concerns and ensure updates are provided. Thank you for your feedback, and have a great day.
[human]: Thank you.`,
  },

  {
    id: "CA00000000000000000000000000000015",
    callSid: "CA00000000000000000000000000000015",
    feedback:
      "SMS OTP allows customers to reset their password, even if they've lost their phone.",
    summary: "Customer lost phone and is unable to log into their account",
    topics: [
      "password_reset_requests",
      "online_portal_technical_issues",
      "communication_clarity",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. How can I assist you today?
[human]: Hi, I can't log into my account. It keeps saying that my username or password is incorrect.
[bot]: I'm sorry to hear that. Let's get this sorted out for you. Could you confirm your registered email address with us?
[human]: Sure, it's johndoe@example.com.
[bot]: Great, thank you. Let me check on that for you. It seems like your account is active, but you may need to reset your password. Would you like me to assist you with that?
[human]: Yes, please.
[bot]: Alright. I'll be sending a One-Time Password (OTP) to the phone number registered with your account. Could you confirm that you have access to the phone number ending in 1234?
[human]: Yes, I do.
[bot]: Perfect. Please watch for a text message with the OTP shortly. Let me know once you've received it.
[human]: Okay, I just got it. The code is 567890.
[bot]: Thank you for confirming. Let's proceed. Please create a new password that is at least 8 characters long, contains a mix of letters, numbers, and special characters.
[human]: Alright, I've created a new password.
[bot]: Excellent. Now you should be able to log in with your new password. Could you try logging in again to confirm it works?
[human]: I'm in now. Thank you so much for the help!
[bot]: You're welcome! If you have any more issues, feel free to call us back. Have a great day!
[human]: You too!`,
  },

  {
    id: "CA00000000000000000000000000000016",
    callSid: "CA00000000000000000000000000000016",
    feedback:
      "Clearly explain jumbo loan requirements and differences upfront, focusing on credit scores, income proof, and typical down payment expectations.",
    summary:
      "The bot explained jumbo loans and their requirements for a high-value home purchase.",
    topics: [
      "jumbo_loan_qualifications",
      "down_payment_requirements",
      "interest_rate_questions",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage, how can I assist you today?
[human]: Hi, I'm considering buying a home listed at $950,000, but I was told this exceeds conventional loan limits in my area. What does this mean?
[bot]: Great question. This means the home's price is above the conforming loan limits set by your region. For homes priced like yours, you may need a jumbo loan. Have you heard of jumbo loans before?
[human]: No, I haven't. What is it?
[bot]: A jumbo loan is for homes that exceed conforming loan limits. It requires higher credit scores, solid income proof, and often has stricter guidelines.
[human]: What are the typical credit and income requirements?
[bot]: Lenders look for a credit score of 700 or higher and documented proof of consistent income to cover payments.
[human]: Are there specific down payment requirements?
[bot]: Yes, jumbo loans often require at least 20% for a down payment, though exceptions may exist for strong profiles.
[human]: Are the rates for a jumbo loan higher than normal?
[bot]: Jumbo loans typically have slightly higher interest rates since they pose more risk to lenders, but rates vary based on your profile.
[human]: I see. So, it's basically a more rigorous process, right?
[bot]: Correct. Jumbo loans involve more scrutiny but enable financing for high-value properties. I can connect you with a loan specialist if you're interested.
[human]: Okay. I'll think about it first. This was helpful, thank you.
[bot]: You're welcome! Feel free to reach out if you decide to proceed or have additional questions. Have a great day!`,
  },

  {
    id: "CA00000000000000000000000000000017",
    callSid: "CA00000000000000000000000000000017",
    feedback:
      "Explain the importance of credit supplements clearly when a borrower's credit report has not updated to reflect forgiven loans.",
    summary:
      "The bot explained how credit supplements help reflect forgiven student loans for DTI calculations under FHA and conventional guidelines.",
    topics: [
      "income_verification_questions",
      "credit_score_concerns",
      "government_backed_loan_options",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage, how can I assist you today? [human]: Hi, I'm David, a public school teacher. My federal student loans were recently forgiven under PSLF, but I'm confused about how underwriters will handle this on my DTI since my credit report still shows the old balance. [bot]: Thank you for sharing, David, and congratulations on your loan forgiveness! Let's clarify this for you. Typically, underwriters will need written proof of student loan forgiveness, which can be in the form of official documentation or a credit report supplement reflecting a zero balance. Have you received any written confirmation? [human]: Yes, I have the forgiveness letter from the loan servicer. My credit report hasn't updated yet. [bot]: That forgiveness letter is definitely helpful. Additionally, underwriters often request credit supplements to confirm the zero balance if the credit report hasn't updated yet. Have your lender or credit bureau issue a supplement to expedite the update. [human]: Okay, I didn't know about credit supplements. Will this help regardless of the loan type? [bot]: Exactly. Credit supplements can be used regardless of whether you're pursuing an FHA or conventional loan. Both types of loan guidelines rely on updated documentation or adjustments from the lender. [human]: Thank you. So once the report updates, I'm good, right? [bot]: That's correct. Once the supplement or report shows a zero balance, the forgiven student loan shouldn't impact your DTI anymore. [human]: Thanks! That really clears it up. [bot]: You're welcome, David. If you need detailed assistance on obtaining supplements, feel free to contact us anytime. Have a wonderful day!`,
  },

  {
    id: "CA00000000000000000000000000000018",
    callSid: "CA00000000000000000000000000000018",
    feedback:
      "When explaining Fannie Mae's 10-property limit, ensure you clearly detail reserve requirements and offer alternative financing options to avoid borrower frustration.",
    summary:
      "The bot informed Shannon about Fannie Mae's limits, reserve requirements, and suggested DSCR or portfolio loans.",
    topics: [
      "conventional_loan_information",
      "investment_property_limitations",
      "portfolio_loans",
    ],
    transcript: `\
[bot]: Hello, Shannon, this is Owl Mortgage. How can I assist you today?
[human]: Hi, I'm looking to finance a sixth investment property, but I've heard I might be running into some limits.
[bot]: Thanks for sharing that. You're correct that there are restrictions. For conventional financing through Fannie Mae, there's a limit of 10 financed properties. Properties 5-10 come with stricter reserve requirements.
[human]: What exactly do you mean by reserve requirements?
[bot]: Reserve requirements refer to the amount of liquid or cash-equivalent assets you need to have available post-closing, calculated as a percentage of the unpaid principal balance of all financed properties. For your situation, higher reserves will be required since this is your sixth property.
[human]: What kind of numbers are we talking about?
[bot]: Generally, for investment properties, this would be six months' worth of payments on the property you're purchasing and additional reserves for other properties you own. It varies based on the type and unpaid principal balance of each.
[human]: That does sound pretty complicated. What are my options if I can't meet these requirements?
[bot]: One alternative to consider is portfolio loans, which are offered by private lenders and may provide more flexibility without strict property limits. Another option is DSCR loans—Debt Service Coverage Ratio loans—which focus on rental income from properties rather than personal income and reserves.
[human]: Are portfolio loans or DSCR loans better?
[bot]: It depends on your investment strategy. If you're looking to scale your portfolio quickly, DSCR loans are often a good fit for rental properties with steady cash flow. Portfolio loans offer flexibility on underwriting requirements.
[human]: Thanks for the information. I'll need some time to think this over and do the math.
[bot]: Absolutely, Shannon. If you need help assessing your assets or exploring those alternatives, don't hesitate to reach out. Have a great day.
[human]: Thank you. Goodbye.
[bot]: Goodbye!`,
  },

  {
    id: "CA00000000000000000000000000000019",
    callSid: "CA00000000000000000000000000000019",
    feedback:
      "When a language barrier is detected, immediately confirm the customer's preferred language to ensure seamless communication.",
    summary:
      "The bot switched to Spanish after identifying a language barrier.",
    topics: ["communication_clarity", "representative_knowledge_concerns"],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. How may I assist you today?
[human]: Hola, no entiendo inglés. ¿Habla español?
[bot]: Ah, entiendo. Por favor, permítame cambiar al español. Hola, ¿cómo puedo ayudarte con tu hipoteca?
[human]: Sí, gracias. Necesito ayuda con los requisitos de pago inicial.
[bot]: Por supuesto. Para los requisitos de pago inicial, necesitamos revisar tu puntuación de crédito y tus ingresos. ¿Puedes compartir tu puntaje de crédito?
[human]: Mi puntaje es 720.
[bot]: Excelente. Con ese puntaje, calificarías para múltiples opciones. ¿Qué tan pronto planeas comprar la casa?
[human]: En las próximas semanas.
[bot]: Entendido. Entonces podemos avanzar rápidamente. ¿Necesitas ayuda con la pre-calificación?
[human]: Sí, ¿cuáles son los pasos?
[bot]: Necesitarás enviar algunos documentos, como prueba de ingresos y verificación de empleo. ¿Puedo enviarte un enlace donde puedes subir tus documentos?
[human]: Sí, por favor.
[bot]: Perfecto, envié el enlace a tu correo electrónico. Por favor notifícame si necesitas ayuda adicional.
[human]: Gracias, eso ayuda mucho.
[bot]: Por supuesto, estamos aquí para ayudarte. Gracias por contactar a Owl Mortgage. ¡Ten un buen día!
[human]: Igualmente, gracias.`,
  },

  {
    id: "CA00000000000000000000000000000020",
    callSid: "CA00000000000000000000000000000020",
    feedback:
      "Quickly switch to the customer's preferred language before diving into technical solutions.",
    summary: "Customer had technical issues due to app language settings.",
    topics: ["online_portal_technical_issues", "communication_clarity"],
    transcript: `[bot]: Hello, you've reached Owl Mortgage. How may I assist you today?
    [human]: Bonjour, je ne peux pas accéder au portail en ligne. Pouvez-vous m'aider ?
    [bot]: Bien sûr. Permettez-moi de parler en français. Pouvez-vous me dire ce qui se passe lorsque vous essayez de vous connecter ?
    [human]: Lorsque j'entre mon mot de passe, cela dit « erreur serveur ». Je ne comprends pas.
    [bot]: Je comprends. Cela peut être un problème technique temporaire. Avez-vous essayé de réinitialiser votre mot de passe ?
    [human]: Non, pas encore. Pouvez-vous m'expliquer comment ?
    [bot]: Bien sûr. Je vais vous envoyer un lien pour réinitialiser votre mot de passe. Cliquez simplement dessus et suivez les instructions.
    [human]: D'accord, merci. Et si cela ne fonctionne pas ?
    [bot]: Si cela ne fonctionne pas, vous pouvez essayer de vider le cache de votre navigateur ou utiliser un autre navigateur. Voulez-vous que je vous explique comment faire ?
    [human]: Oui, s'il vous plaît.
    [bot]: Très bien. Pour vider le cache, allez dans les paramètres de votre navigateur, trouvez la section « Historique » et sélectionnez « Vider le cache ». Sinon, ouvrez un autre navigateur comme Chrome ou Firefox et essayez à nouveau.
    [human]: Merci, je vais essayer.
    [bot]: Parfait. Si vous avez encore des problèmes, contactez-nous. Nous sommes là pour vous aider.
    [human]: Merci beaucoup pour votre aide.
    [bot]: C'est un plaisir de vous aider. Bonne journée !
    [human]: Merci, au revoir.`,
  },
  {
    id: "CA00000000000000000000000000000021",
    callSid: "CA00000000000000000000000000000021",
    feedback:
      "When call quality is poor, quickly offer an alternative like SMS to avoid customer frustration.",
    summary: "Customer hung up due to poor call quality.",
    topics: ["communication_clarity", "application_status_updates"],
    transcript: `\
[bot]: Hello, Owl Mortgage here. Can I help you?
[human]: Hi. check. My loan.
[bot]: Sure. Loan ID?
[human]: Seven, eight, four
[bot]: I'm sorry I didn't catch that. Can you...
[human]: sever august
[bot]: You appear to be having a connection issue.
[human]: Can you hear? Hello?
[human]: youre... cutting…
[human]: Ugh. Bye.
[bot]: Sorry. Call back soon.`,
  },

  {
    id: "CA00000000000000000000000000000022",
    callSid: "CA00000000000000000000000000000022",
    feedback:
      "When helping borrowers who have experienced identity theft, clearly explain how fraudulent accounts impact the DTI ratio by inflating debt and lowering credit scores.",
    summary:
      "Discussed pre-qualification despite fraudulent accounts and provided specific steps to address credit issues.",
    topics: [
      "pre_qualification_inquiries",
      "credit_score_concerns",
      "disclosure_statement_questions",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. How can I assist you today?
[human]: Hi, I recently discovered fraudulent accounts on my credit report, and I'm wondering if this will affect my ability to be pre-qualified for a mortgage.
[bot]: I'm sorry to hear that. Fraudulent accounts can be frustrating to deal with. Have you already taken steps to address the issue?
[human]: Yes, I filed a police report and placed a fraud alert with the credit bureaus, but the accounts are still showing up.
[bot]: That's a good start. At Owl Mortgage, we can still issue a pre-qualification using a soft pull. This means we won't pull your full credit report just yet.
[human]: That's helpful. But how will the fraud impact my qualification?
[bot]: Fraudulent accounts may inflate your debt-to-income (DTI) ratio by falsely increasing your reported debts, and they can lower your credit score. These factors are important for determining your eligibility and loan terms. However, we assess each situation individually and may be able to work around the issue.
[human]: What should I do next to fix my credit report?
[bot]: First, freeze your credit with all three major bureaus to prevent further unauthorized activity. Then carefully file disputes with the bureaus to remove each fraudulent tradeline. If the bureaus fail to respond, escalate by filing a complaint with the Consumer Financial Protection Bureau (CFPB). Their oversight can help resolve unresolved cases.
[human]: Do I need clean credit before applying for a mortgage?
[bot]: Not necessarily. While clean credit can improve your loan options, our pre-qualification process can account for your current credit situation and find a solution tailored to your needs.
[human]: I appreciate the information. This has been helpful.
[bot]: You're very welcome, Samantha. If you have more questions or need further assistance, don't hesitate to give us a call again. Have a great day.
[human]: Thank you, you too.`,
  },

  {
    id: "CA00000000000000000000000000000023",
    callSid: "CA00000000000000000000000000000023",
    feedback:
      "When addressing identity theft concerns, emphasize how providing proof of disputes and resolving credit anomalies is crucial for a manual underwriting request.",
    summary: "Caller suspects identity theft after AUS denial",
    topics: [
      "credit_score_concerns",
      "fraud_and_identity_theft",
      "manual_underwriting_guidance",
    ],
    transcript: `\
[bot]: Hello, you've reached Owl Mortgage. How can I assist you today?
[human]: Hi, my loan application recently got a 'Refer' in DU, and my loan officer said it might be due to some strange activity on my credit. I checked, and I found new credit inquiries and two credit cards I didn't open. I think I might be a victim of identity theft.
[bot]: I'm sorry to hear about this, Marcus. Identity theft can certainly impact the outcome of an AUS decision. Unauthorized accounts or inquiries can inflate your debt-to-income ratio and create anomalies that trigger a 'Refer' or denial.
[human]: That's a lot to take in. What can I do to fix this?
[bot]: The first step is to file a fraud report with the Federal Trade Commission at identitytheft.gov. This creates a record of your identity theft claim, which is important for disputes.
[human]: Should I contact the credit bureaus, too?
[bot]: Absolutely. You should place fraud alerts on your credit files with the three major bureaus: Experian, Equifax, and TransUnion. You can also freeze your credit to prevent further unauthorized activity.
[human]: How do I handle the accounts I didn't open?
[bot]: You'll need to dispute the fraudulent accounts directly with the creditors and the credit bureaus. Provide them with your fraud report and any additional documentation they require.
[human]: Okay, once that's done, can I still move forward with my mortgage?
[bot]: Yes, but since your desktop underwriting was flagged, you might need to request a manual underwrite. If you provide documentation that proves the fraudulent accounts aren't yours and initiated disputes, an underwriter can assess your case without the automated system.
[human]: That makes sense. Can I still contact your team while I work through this?
[bot]: Of course, Marcus. We're here to help guide you through the process. Once your credit report reflects the corrections, let us know, and we'll revisit your application to explore your options.
[human]: Thanks, that's really helpful.
[bot]: You're welcome. Addressing identity theft can be a difficult process, but with the right steps, you're on the path to resolving it and achieving your goals. Have a good day, Marcus.
[human]: Thanks, you too.`,
  },
];

export async function deleteAllRecallData() {
  const allCurrent = await searchTranscript("", { active: true }, 500);

  for (const item of allCurrent) {
    console.log("deleting", item.document.id);
    await deleteTranscript(item.document.id);
  }
}

export async function insertDummyRecallData() {
  for (const item of examples) {
    console.log(item.id, " inserting");
    await insertTranscript(item.transcript, {
      callSid: item.callSid,
      id: item.id,
      active: true,
      feedback: item.feedback,
      summary: item.summary,
      topics: item.topics,
    });

    console.log(item.id, " inserted");
  }
}

export async function resetRecallData() {
  await deleteAllRecallData();
  await insertDummyRecallData();
}
