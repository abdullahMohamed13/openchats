
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <div className="flex min-h-svh items-center justify-center">
		{children}
	</div>
}