import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-jet py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 flex flex-col items-center">
                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary: 'bg-gold hover:bg-gold-600 text-jet font-semibold',
                            footerActionLink: 'text-gold hover:text-gold-400',
                            card: 'bg-navy border border-white/10 shadow-xl',
                            headerTitle: 'text-white font-display',
                            headerSubtitle: 'text-white/60',
                            socialButtonsBlockButton: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
                            socialButtonsBlockButtonText: 'text-white',
                            formFieldLabel: 'text-white/80',
                            formFieldInput: 'bg-white/5 border-white/10 text-white',
                            dividerLine: 'bg-white/10',
                            dividerText: 'text-white/40',
                        }
                    }}
                />
            </div>
        </div>
    )
}
