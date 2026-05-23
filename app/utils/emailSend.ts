import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API);

interface EmailProps {
	user_email: string,
	subject: string,
	message: string,
}

export function emailSend({user_email, subject, message}: EmailProps) {
	resend.emails.send({
	  from: 'onechat.eg@gmail.com',
	  to: user_email,
	  subject: subject,
		html: message,
		// example: '<p>Congrats on sending your <strong>first email</strong>!</p>'
	});
} 