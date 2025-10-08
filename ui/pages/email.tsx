import Head from 'next/head';
import Image from "next/image";
import { useRouter } from 'next/router';

export default function EmailPage() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/owl/forms/19B-8671-D');
  };

  return (
    <>
      <Head>
        <title>Complete your joint home loan application - Owl Homes</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>{`
          html, body, #__next {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            overflow: hidden;
            background-color: #ffffff;
          }
        `}</style>
      </Head>

      {/* Alternative approach to hide any inherited headers:
          Add a pseudo-element that covers only the very top of the page */}
      <style jsx global>{`
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: #ffffff;
          z-index: 2000;
        }
      `}</style>

      {/* Clickable image container */}
      <div
        onClick={handleClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          padding: 0,
          overflow: "hidden",
          cursor: "pointer",
          zIndex: 100,
          backgroundColor: "#ffffff"
        }}
      >
        <Image
          src="/email.png"
          alt="Email"
          fill
          sizes="100vw"
          style={{
            objectFit: "contain"
          }}
          priority
        />
      </div>
    </>
  );
}
