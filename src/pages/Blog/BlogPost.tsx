import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const blogContent = {
  'comment-reussir-import-export-afrique': {
    title: 'Comment réussir son activité d\'import-export en Afrique de l\'Ouest',
    excerpt: 'Découvrez les clés du succès pour développer votre commerce B2B en Afrique de l\'Ouest.',
    category: 'Guide',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&h=600&fit=crop',
    date: '2024-11-15',
    readTime: '8 min',
    content: `
# Introduction

L'Afrique de l'Ouest représente un marché en pleine croissance pour les activités d'import-export. 
Avec une population jeune et dynamique, une classe moyenne en expansion et une digitalisation 
croissante, les opportunités sont nombreuses pour les entrepreneurs B2B.

## Les fondamentaux du succès

### 1. Comprendre le marché local

Avant de se lancer, il est essentiel de bien comprendre les spécificités du marché ouest-africain :
- Les préférences culturelles et commerciales
- Les circuits de distribution existants
- La réglementation douanière et commerciale
- Les modes de paiement privilégiés

### 2. Bâtir un réseau solide

Le succès en Afrique repose largement sur la qualité de votre réseau :
- Participez aux salons professionnels régionaux
- Rejoignez les chambres de commerce locales
- Établissez des partenariats avec des acteurs locaux de confiance

### 3. Sécuriser vos transactions

La sécurité des paiements est primordiale. Utilisez des systèmes de paiement sécurisés comme 
le système Escrow de BokaTrade qui protège à la fois acheteurs et vendeurs.

## Les pièges à éviter

- Ne pas sous-estimer les délais de livraison
- Ignorer les spécificités douanières
- Négliger le service après-vente
- Ne pas adapter ses produits au marché local

## Conclusion

Le commerce B2B en Afrique de l'Ouest offre d'immenses opportunités pour ceux qui prennent 
le temps de bien se préparer et de construire des relations solides.
    `
  },
  'systeme-escrow-securite-transactions': {
    title: 'Système Escrow : La sécurité avant tout dans vos transactions B2B',
    excerpt: 'Comprendre le fonctionnement du système Escrow et comment il protège vos transactions.',
    category: 'Sécurité',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop',
    date: '2024-11-10',
    readTime: '6 min',
    content: `
# Qu'est-ce qu'un système Escrow ?

Le système Escrow (ou séquestre) est un mécanisme de sécurisation des transactions qui protège 
à la fois l'acheteur et le vendeur.

## Comment fonctionne l'Escrow sur BokaTrade ?

### Étape 1 : Paiement sécurisé
L'acheteur effectue son paiement qui est immédiatement bloqué sur un compte sécurisé.

### Étape 2 : Expédition
Le vendeur prépare et expédie la commande, en toute confiance que le paiement est garanti.

### Étape 3 : Livraison et validation
Le livreur confirme la livraison, puis l'acheteur valide la réception conforme.

### Étape 4 : Déblocage des fonds
Une fois toutes les validations effectuées, les fonds sont automatiquement transférés au vendeur.

## Les avantages du système Escrow

- **Pour l'acheteur** : Garantie de ne payer que si la marchandise est conforme
- **Pour le vendeur** : Assurance d'être payé une fois la livraison effectuée
- **Pour le livreur** : Validation formelle de son intervention

## Conclusion

Le système Escrow élimine les risques de fraude et instaure un climat de confiance 
indispensable au développement du commerce B2B.
    `
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogContent[slug as keyof typeof blogContent] : null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Lien copié dans le presse-papier');
  };

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <Link to="/blog">
            <Button>Retour au blog</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        keywords="b2b, commerce afrique, marketplace"
        ogImage={post.image}
        canonical={`/blog/${slug}`}
      />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        
        <main className="flex-1">
          {/* Back Button */}
          <div className="container pt-6">
            <Link to="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au blog
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="container py-8">
            <div className="aspect-[21/9] overflow-hidden rounded-lg">
              <img
                src={post.image}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Article Content */}
          <article className="container max-w-4xl pb-12">
            <div className="mb-6">
              <Badge className="mb-4">{post.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="ml-auto"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              {post.content.split('\n').map((paragraph, idx) => {
                if (paragraph.startsWith('# ')) {
                  return <h1 key={idx} className="text-3xl font-bold mt-8 mb-4">{paragraph.replace('# ', '')}</h1>;
                }
                if (paragraph.startsWith('## ')) {
                  return <h2 key={idx} className="text-2xl font-bold mt-6 mb-3">{paragraph.replace('## ', '')}</h2>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={idx} className="text-xl font-semibold mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                }
                if (paragraph.startsWith('- ')) {
                  return <li key={idx} className="ml-6">{paragraph.replace('- ', '')}</li>;
                }
                if (paragraph.trim()) {
                  return <p key={idx} className="mb-4 text-muted-foreground leading-relaxed">{paragraph}</p>;
                }
                return null;
              })}
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
