import { Sparkles, ArrowRight, LockKeyholeOpen } from "lucide-react";

export default function SharedVaultPage() {
    return (
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12 font-sans overflow-hidden">
            <div className="max-w-4xl w-full flex flex-col items-center justify-center">
                <div className="text-center mb-12">
                    <h1 className="font-playfair text-4xl text-[var(--foreground)] mb-4 flex items-center justify-center gap-3">
                        <LockKeyholeOpen className="w-8 h-8 text-[#D4AF37]" strokeWidth={1} />
                        The AI Access Vault
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] tracking-wide font-light max-w-lg mx-auto">
                        A dialogue with your history. I am granted access only to the memories you choose to share here.
                    </p>
                </div>

                <div className="w-full bg-white rounded-2xl p-8 sm:p-12 shadow-layered border-subtle min-h-[500px] flex flex-col relative overflow-hidden">
                    <div className="flex gap-6 mb-8 max-w-2xl">
                        <div className="w-10 h-10 rounded-full bg-[#F2EFE9] border-subtle flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2 font-medium">Cuvée Intelligence</div>
                            <p className="font-playfair text-lg text-[var(--foreground)] leading-relaxed">
                                I notice you revisited your memory of "Summer in Paris" from August 2025. You mentioned the light over the Seine. Would you like me to draw connections between that trip and your recent thoughts on finding peace?
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-[var(--border-color)]">
                        <div className="relative">
                            <textarea
                                className="w-full bg-[#F9F8F6] rounded-xl p-4 pr-12 outline-none resize-none text-sm leading-relaxed text-[var(--foreground)] placeholder:text-[var(--text-muted)] placeholder:font-light border-subtle focus:ring-1 focus:ring-[#D4AF37]/30 transition-shadow h-24"
                                placeholder="Continue the dialogue..."
                            />
                            <button className="absolute bottom-4 right-4 p-2 bg-[var(--foreground)] text-[var(--background)] rounded-full hover:bg-black transition-colors shadow-md">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}