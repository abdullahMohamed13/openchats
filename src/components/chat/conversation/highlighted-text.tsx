export function HighlightedText({ text, term }: { text: string; term: string }) {
	const normalized = term.trim();
	if (!normalized) return <>{text}</>;

	const index = text.toLowerCase().indexOf(normalized.toLowerCase());
	if (index === -1) return <>{text}</>;

	return (
		<>
			{text.slice(0, index)}
			<mark className="bg-primary/30 text-foreground">
				{text.slice(index, index + normalized.length)}
			</mark>
			{text.slice(index + normalized.length)}
		</>
	);
}