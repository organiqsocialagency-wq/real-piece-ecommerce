# Real Piece

Concept di ecommerce per T-shirt Real Piece, realizzato in HTML, CSS e JavaScript.

La pagina presenta le **otto grafiche Great Era** fornite dal brand, con mockup illustrativi e prezzi dimostrativi. La guida taglie usa le misure indicate per il modello utilizzato. Ogni prodotto permette di scegliere fra nove colori (Nero, Giallo, Blu, Verde, Viola, Bianco, Rosso, Crema e Grigio) e le taglie XS–5XL. Il mockup mantiene lo stesso modello, con vestibilità regular e logo più piccolo ispirati alle foto reali fornite. La scelta del colore aggiorna il tessuto sia nel catalogo sia nella scheda e nel carrello; il carrello distingue colore e taglia, conserva la scelta e aggiorna i vecchi articoli salvati assegnando loro Nero. Il carrello funziona solo nel browser: gli acquisti non sono attivi.

La sezione recensioni include due feedback con foto forniti dall’utente e nove testi dimostrativi, indicati nella nota generale della sezione. La prossima collezione ha un’anteprima con effetto DecayCard, sfondo LiquidEther nei colori del mare e countdown al 1 febbraio 2027, in attesa della data ufficiale del drop. Gli effetti ispirati ai componenti React Bits forniti sono adattati a JavaScript senza dipendenze; rispettano le preferenze di movimento ridotto.

## Anteprima locale

```sh
python3 -m http.server 4173
```

Aprire `http://localhost:4173` dalla cartella del repository.

## Prima della vendita

Servono un catalogo approvato, un checkout reale, inventario e informazioni definitive su spedizioni, resi, privacy e condizioni di vendita.

Design ispirato alla struttura del template [UniClub](https://templatesjungle.com/downloads/uniclub-t-shirt-bootstrap-5-ecommerce-website-template/).

## Prezzi, benvenuto e spedizione dimostrativi

Ogni maglia costa 35 €. Alla prima visita della promozione compare un benvenuto chiaramente dimostrativo: 10 € in meno per ogni capo per 10 minuti. La scadenza è salvata localmente e non ricomincia con il ricaricamento; senza storage resta valida nella sessione corrente. Non è una verifica del primo ordine reale.

La spedizione è gratuita da 50 € di prodotti **dopo gli sconti**; altrimenti costa 3,70 €. Il riepilogo e il carrello condividono il calcolo in centesimi. La barra mostra il progresso verso i 50 €; la ripartizione dimostrativa è 78% Real Piece / 22% cliente sotto soglia, 100% / 0% sopra soglia. Consegna stimata: 1–2 settimane dall’ordine.

Le recensioni sono presentate in un DriftWall adattato dal componente React Bits fornito, con colonne alternate, arresto immediato della colonna al passaggio del mouse e lettura completa. Su mobile e con movimento ridotto restano disponibili gli articoli statici originali.

La hero usa una comparsa AnimatedContent con fade, salita di 64 px e ingresso progressivo di titolo, testo e CTA; l’header non è animato. L’effetto viene eseguito una volta ed è disabilitato con movimento ridotto.
