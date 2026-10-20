import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/app/styles/index.css';
import { Button } from '../../src/shared/ui/Button';
import { Card } from '../../src/shared/ui/Card';
import { Input } from '../../src/shared/ui/Input';
import { NavItem } from '../../src/shared/ui/NavItem';
import { Tag } from '../../src/shared/ui/Tag';
import { Tooltip } from '../../src/shared/ui/Tooltip';

function UiKit() {
  const [loading, setLoading] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <main className="mx-auto max-w-5xl space-y-10 p-6 sm:p-10">
      <header className="space-y-3">
        <Tag label="VIR-18 / UI Kit" />
        <h1 className="text-3xl font-medium">VIRaTeC UI Kit</h1>
        <p className="text-text-muted">Reusable components from the Figma design kit.</p>
        <p lang="uk" className="text-text-muted">
          Дослідження, інновації та співпраця.
        </p>
      </header>
      <section aria-labelledby="buttons-title" className="space-y-4">
        <h2 id="buttons-title" className="text-card-title">
          Button
        </h2>
        <div className="flex flex-wrap items-center gap-6 rounded-card bg-bg-surface p-6">
          <Button
            data-testid="primary-lg"
            label="Button"
            size="lg"
            showArrow
            onClick={() => setClicks((value) => value + 1)}
          />
          <Button
            data-testid="primary-md"
            label="Button"
            showArrow
            onClick={() => setClicks((value) => value + 1)}
          />
          <Button
            data-testid="secondary-lg"
            label="Button"
            variant="secondary"
            size="lg"
            showArrow
            onClick={() => setClicks((value) => value + 1)}
          />
          <Button
            data-testid="secondary-md"
            label="Button"
            variant="secondary"
            showArrow
            onClick={() => setClicks((value) => value + 1)}
          />
          <Button label="Disabled" disabled />
          <Button
            label="Save changes"
            loading={loading}
            data-testid="busy-button"
            onClick={() => {
              setLoading(true);
              setClicks((value) => value + 1);
            }}
          />
          <Button label="Reset loading" variant="secondary" onClick={() => setLoading(false)} />
          <Button
            label="Override padding"
            className="px-2 text-sm"
            data-testid="override-button"
            onClick={() => setClicks((value) => value + 1)}
          />
        </div>
        <p role="status">Activations: {clicks}</p>
      </section>
      <section aria-labelledby="tags-title" className="space-y-4">
        <h2 id="tags-title" className="text-card-title">
          Tag
        </h2>
        <div className="flex flex-wrap gap-6 rounded-card bg-bg-surface p-6">
          <Tag label="Research area" />
          <Tag label="Research area" color="cyan" />
        </div>
      </section>
      <section aria-labelledby="nav-title" className="space-y-4">
        <h2 id="nav-title" className="text-card-title">
          Nav Item
        </h2>
        <nav
          aria-label="Example navigation"
          className="flex flex-wrap gap-6 rounded-card bg-bg-surface p-6"
        >
          <NavItem href="#cards-title" label="Research" />
          <NavItem href="#inputs-title" label="Contact" active />
          <NavItem
            label="About"
            dropdown
            active={expanded}
            expanded={expanded}
            aria-controls="about-links"
            onClick={() => setExpanded((value) => !value)}
          />
        </nav>
        <div id="about-links" hidden={!expanded}>
          <NavItem label="About VIRaTeC" href="#cards-title" />
        </div>
      </section>
      <section aria-labelledby="inputs-title" className="space-y-4">
        <h2 id="inputs-title" className="text-card-title">
          Input
        </h2>
        <form
          noValidate
          onSubmit={(event) => event.preventDefault()}
          className="grid gap-6 rounded-card bg-bg-surface p-6 md:grid-cols-3"
        >
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="name@knu.ua"
          />
          <Input
            label="Email with help"
            type="email"
            defaultValue="larysa@knu.ua"
            helperText="Use your university address."
          />
          <Input
            label="Invalid email"
            id="invalid-email"
            defaultValue="larysa@"
            error="Enter a valid email address"
            helperText="Use an address containing a domain."
            aria-describedby="external-help"
          />
          <Input label="Disabled input" disabled defaultValue="name@knu.ua" />
          <Input label="Read-only input" readOnly defaultValue="name@knu.ua" />
          <p id="external-help" className="text-caption text-text-muted">
            This address will be used for replies.
          </p>
        </form>
      </section>
      <section aria-labelledby="tooltip-title" className="space-y-4">
        <h2 id="tooltip-title" className="text-card-title">
          Tooltip
        </h2>
        <div className="flex flex-wrap gap-6 rounded-card bg-bg-surface p-6">
          <Tooltip text="Search research" placement="top">
            <Button
              label="Top tooltip"
              ref={triggerRef}
              aria-describedby="trigger-help"
              onClick={() => setClicks((value) => value + 1)}
            />
          </Tooltip>
          <Tooltip text="Search publications" placement="bottom">
            <Button label="Bottom tooltip" onClick={() => setClicks((value) => value + 1)} />
          </Tooltip>
          <Tooltip text={'ResearchAcrossBorders'.repeat(15)}>
            <Button label="Long tooltip" onClick={() => setClicks((value) => value + 1)} />
          </Tooltip>
          <Button
            label="Focus tooltip trigger"
            variant="secondary"
            onClick={() => triggerRef.current?.focus()}
          />
        </div>
        <p id="trigger-help" className="text-caption text-text-muted">
          Search the research catalogue.
        </p>
      </section>
      <section aria-labelledby="cards-title" className="space-y-4">
        <h2 id="cards-title" className="text-card-title">
          Card
        </h2>
        <div className="grid items-stretch gap-6 md:grid-cols-3" data-testid="card-row">
          <Card
            title="Card title"
            tagLabel="Research area"
            description="Short description of the research area or project, two to three lines long."
            href="#buttons-title"
          />
          <Card
            title="Research that crosses borders"
            tagLabel="Project"
            tagColor="cyan"
            description="Mixed international teams solve real problems across cultures and time zones. Workshops and mentoring turn what students learn into applied solutions."
            href="#buttons-title"
          />
          <Card
            title="Knowledge → implementation"
            tagLabel="ResearchAcrossBordersAndDisciplinesWithoutWhitespace"
            description={'ResearchAcrossBorders'.repeat(8)}
            href="#buttons-title"
          />
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<UiKit />);
